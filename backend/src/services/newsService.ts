import { client } from "../config/db";

const CRYPTO_NEWS_API_URL =
  process.env.CRYPTO_NEWS_API_URL ||
  "https://min-api.cryptocompare.com/data/v2/news/?lang=EN";

// 한 번에 처리할 최대 뉴스 건수 (env로 조절 가능)
const MAX_NEWS_ITEMS = Number(process.env.MAX_NEWS_ITEMS) || 10;

export interface NewsItem {
  id: number;
  published_on: number;
  imageurl: string;
  title: string;
  url: string;
  body: string;
  tags: string;
  source_name: string;
}

/**
 * 외부 API에서 원본 뉴스 가져오기 (global.fetch 사용)
 * title이나 body가 비어 있으면 필터링합니다.
 */
export async function fetchCryptoNews(): Promise<NewsItem[]> {
  const res = await fetch(CRYPTO_NEWS_API_URL);
  if (!res.ok) {
    throw new Error(`뉴스 API 요청 실패: ${res.status}`);
  }

  const { Data } = await res.json();
  if (!Array.isArray(Data)) {
    return [];
  }

  // 무결성 검사: title 및 body가 반드시 존재해야 함
  const valid = Data.filter(
    (item: any) =>
      typeof item.title === "string" &&
      item.title.trim() !== "" &&
      typeof item.body === "string" &&
      item.body.trim() !== ""
  );

  return valid.map((item: any) => ({
    id: typeof item.id === "string" ? Number(item.id) : item.id,
    published_on: item.published_on,
    imageurl: item.imageurl,
    title: item.title,
    url: item.url,
    body: item.body,
    tags: item.tags,
    source_name: item.source_info?.name || "",
  }));
}

/**
 * DB에 upsert 수행
 *  - title/body 무결성은 fetchCryptoNews()에서 이미 보장됨
 *  - tags 문자열을 '|' 구분자로 분할하여 TEXT[] 배열로 저장
 */
async function saveNewsItems(items: NewsItem[]): Promise<void> {
  const sql = `
    INSERT INTO news
      (id, title, content, thumbnail, published_at, source, tags, url)
    VALUES
      ($1, $2, $3, $4, to_timestamp($5), $6, $7, $8)
    ON CONFLICT (id) DO NOTHING;
  `;

  for (const it of items) {
    // 안전망: 혹시 누락된 title/body가 있으면 스킵
    if (!it.title.trim() || !it.body.trim()) {
      console.warn(`Skipping id=${it.id}: missing title or body`);
      continue;
    }

    // '|' 구분자로 태그 분할 후 배열 생성
    const tagsArr = it.tags
      ? it.tags
          .split("|")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const params = [
      it.id,
      it.title,
      it.body,
      it.imageurl,
      it.published_on,
      it.source_name,
      tagsArr,
      it.url,
    ];

    try {
      await client.query(sql, params);
    } catch (err) {
      console.error(`❌ 뉴스 저장 실패 id=${it.id}`, err);
    }
  }
}

/**
 * 외부 API → DB 저장 전체 워크플로우
 */
export async function updateCryptoNews(): Promise<void> {
  const all = await fetchCryptoNews();
  if (all.length === 0) {
    console.log("ℹ️ 새로운 뉴스가 없습니다.");
    return;
  }

  const sliceItems = all.slice(0, MAX_NEWS_ITEMS);
  console.log(`🔄 최신 뉴스 ${sliceItems.length}건 DB 저장 시작`);
  await saveNewsItems(sliceItems);
  console.log("✅ 뉴스 저장 완료");
}

/**
 * DB에서 뉴스 목록 조회
 */
export async function getNewsList(): Promise<
  {
    id: number;
    title: string;
    content: string;
    thumbnail: string;
    views: number;
    publishedAt: string;
    source: string;
    tags: string[];
    url: string | null;
  }[]
> {
  const sql = `
    SELECT
      id,
      title,
      content,
      thumbnail,
      views,
      to_char(published_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "publishedAt",
      source,
      tags,
      url
    FROM news
    ORDER BY published_at DESC;
  `;
  const { rows } = await client.query(sql);
  return rows;
}

/**
 * DB에서 개별 뉴스 상세 조회
 */
export async function getNewsDetail(id: number): Promise<{
  id: number;
  title: string;
  content: string;
  thumbnail: string;
  publishedAt: string;
  source: string;
  tags: string[];
  url: string | null;
} | null> {
  const sql = `
    SELECT
      id,
      title,
      content,
      thumbnail,
      to_char(published_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "publishedAt",
      source,
      tags,
      url
    FROM news
    WHERE id = $1;
  `;
  const { rows } = await client.query(sql, [id]);
  return rows[0] || null;
}

/**
 * 개발자모드: news 테이블 전체 삭제
 */
export async function deleteAllNews(): Promise<void> {
  await client.query("DELETE FROM news;");
}

export async function incrementNewsViews(id: number): Promise<void> {
  const sql = `
    UPDATE news
       SET views = views + 1
     WHERE id = $1
  `;
  await client.query(sql, [id]);
}

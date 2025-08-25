// backend/src/services/newsService.ts

import { client } from "../config/db";
import { summarizeArticle } from "./modelService";

/** 외부 뉴스 API URL (EN) */
const CRYPTO_NEWS_API_URL =
  process.env.CRYPTO_NEWS_API_URL ||
  "https://min-api.cryptocompare.com/data/v2/news/?lang=EN";

/** 테스트용: 한 번에 처리할 최대 뉴스 건수 */
const MAX_NEWS_ITEMS = Number(process.env.MAX_NEWS_ITEMS) || 50;

/** fetchCryptoNews() 반환 타입 */
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

/** 1) 외부 API에서 원본 뉴스 가져오기 */
export async function fetchCryptoNews(): Promise<NewsItem[]> {
  console.log("[newsService] fetchCryptoNews 시작");
  const res = await fetch(CRYPTO_NEWS_API_URL);
  if (!res.ok) {
    console.error(`[newsService] fetch 실패 status=${res.status}`);
    throw new Error(`뉴스 API 요청 실패: ${res.status}`);
  }

  const { Data } = await res.json();
  if (!Array.isArray(Data)) {
    console.error("[newsService] fetch 결과가 배열이 아닙니다");
    return [];
  }

  const valid = Data.filter(
    (item: any) =>
      typeof item.title === "string" &&
      item.title.trim() &&
      typeof item.body === "string" &&
      item.body.trim()
  );
  console.log(`[newsService] 유효 뉴스 개수: ${valid.length}`);

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

/** 2) 외부 API → DB 저장 + 모델 분석·업데이트 (건별 트랜잭션) */
export async function updateCryptoNews(): Promise<void> {
  console.log("▶ updateCryptoNews 시작");

  // 2-1) Fetch & slice
  const all = await fetchCryptoNews();
  if (all.length === 0) {
    console.log("ℹ️ 새로운 뉴스가 없습니다. 종료");
    return;
  }
  const sliceItems = all.slice(0, MAX_NEWS_ITEMS);
  console.log(
    `[newsService] 처리 대상 ID: ${sliceItems.map((i) => i.id).join(", ")}`
  );

  // per-item 처리
  for (const item of sliceItems) {
    // 각 뉴스별로 개별 트랜잭션 시작
    await client.query("BEGIN");
    console.log(`  ▶ [id=${item.id}] 트랜잭션 BEGIN`);

    try {
      // A) 기본 정보 upsert
      const insertSql = `
        INSERT INTO news
          (id, title, content, thumbnail, published_at, source, tags, url)
        VALUES
          ($1, $2, $3, $4, to_timestamp($5), $6, $7, $8)
        ON CONFLICT (id) DO NOTHING;
      `;
      const tagsArr = item.tags
        ? item.tags
            .split("|")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
      await client.query(insertSql, [
        item.id,
        item.title,
        item.body,
        item.imageurl,
        item.published_on,
        item.source_name,
        tagsArr,
        item.url,
      ]);
      console.log(`    ✔ upsert 완료 id=${item.id}`);

      // B) 모델 호출 (요약·감정·임베딩)
      console.log(`    ▶ 모델 호출 id=${item.id}`);
      const result = await summarizeArticle(item.title, item.body);
      if ((result as any).error) {
        throw new Error(`모델 오류: ${(result as any).error}`);
      }
      console.log(
        `       ← 모델 응답 summary="${result.summary.slice(
          0,
          30
        )}…" sentiment=${result.sentiment}`
      );

      // C) 상세 업데이트
      const updateSql = `
        UPDATE news
           SET title     = $1,
               summary   = $2,
               sentiment = $3,
               embedding = $4::vector
         WHERE id = $5;
      `;
      const vectorLiteral = `[${result.embedding.join(",")}]`;
      await client.query(updateSql, [
        result.title,
        result.summary,
        result.sentiment,
        vectorLiteral,
        item.id,
      ]);
      console.log(`    ✔ 상세 업데이트 완료 id=${item.id}`);

      // D) 커밋
      await client.query("COMMIT");
      console.log(`  ▶ [id=${item.id}] 트랜잭션 COMMIT`);
    } catch (err) {
      console.error(`❌ [id=${item.id}] 처리 중 에러, ROLLBACK`, err);
      await client.query("ROLLBACK");
      // 다음 뉴스로 계속
      continue;
    }
  }

  console.log("✅ 전체 뉴스 업데이트 완료");
}

/** 3) 뉴스 목록 조회 */
export async function getNewsList(): Promise<
  {
    id: number;
    title: string;
    summary: string | null;
    sentiment: "positive" | "negative" | "neutral" | null;
    content: string;
    thumbnail: string;
    views: number;
    publishedAt: string;
    source: string;
    tags: string[];
    url: string | null;
  }[]
> {
  console.log("[newsService] getNewsList 호출");
  const sql = `
    SELECT
      id,
      title,
      summary,
      sentiment,
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
  console.log(`[newsService] getNewsList 반환 개수: ${rows.length}`);
  return rows;
}

/** 4) 개별 뉴스 상세 조회 */
export async function getNewsDetail(id: number): Promise<{
  id: number;
  title: string;
  summary: string | null;
  sentiment: "positive" | "negative" | "neutral" | null;
  content: string;
  thumbnail: string;
  views: number;
  publishedAt: string;
  source: string;
  tags: string[];
  url: string | null;
} | null> {
  console.log(`[newsService] getNewsDetail 호출 id=${id}`);
  const sql = `
    SELECT
      id,
      title,
      summary,
      sentiment,
      content,
      thumbnail,
      views,
      to_char(published_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "publishedAt",
      source,
      tags,
      url
    FROM news
    WHERE id = $1;
  `;
  const { rows } = await client.query(sql, [id]);
  const detail = rows[0] || null;
  console.log(
    `[newsService] getNewsDetail id=${id} ${detail ? "조회 성공" : "결과 없음"}`
  );
  return detail;
}

/** 5) 개발자 모드: 전체 삭제 */
export async function deleteAllNews(): Promise<void> {
  console.log("[newsService] deleteAllNews 호출");
  await client.query("DELETE FROM news;");
  console.log("[newsService] deleteAllNews 완료");
}

/** 6) 조회수 증가 */
export async function incrementNewsViews(id: number): Promise<void> {
  console.log(`[newsService] incrementNewsViews id=${id}`);
  await client.query(
    `
      UPDATE news
         SET views = views + 1
       WHERE id = $1;
    `,
    [id]
  );
  console.log(`[newsService] incrementNewsViews 완료 id=${id}`);
}

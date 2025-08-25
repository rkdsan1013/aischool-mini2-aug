// backend/src/services/newsService.ts

import { client } from "../config/db";
import { summarizeArticle } from "./modelService";

/** 외부 뉴스 API URL (EN) */
const CRYPTO_NEWS_API_URL =
  process.env.CRYPTO_NEWS_API_URL ||
  "https://min-api.cryptocompare.com/data/v2/news/?lang=EN";

/** 테스트용: 한 번에 처리할 최대 뉴스 건수 */
const MAX_NEWS_ITEMS = Number(process.env.MAX_NEWS_ITEMS) || 10;

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
  console.log("[newsService] 1) fetchCryptoNews 시작");
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
    id: typeof item.id === "string" ? Number(item.id) : (item.id as number),
    published_on: item.published_on,
    imageurl: item.imageurl,
    title: item.title,
    url: item.url,
    body: item.body,
    tags: item.tags,
    source_name: item.source_info?.name || "",
  }));
}

/** 2) 외부 API → DB 저장 + 모델 분석·업데이트를 하나의 트랜잭션으로 묶음 */
export async function updateCryptoNews(): Promise<void> {
  console.log("▶ updateCryptoNews 시작");

  // 2-1) Fetch
  const all = await fetchCryptoNews();
  if (all.length === 0) {
    console.log("ℹ️ 새로운 뉴스가 없습니다. 종료");
    return;
  }

  // 2-2) 처리 대상 결정
  const sliceItems = all.slice(0, MAX_NEWS_ITEMS);
  console.log(
    `[newsService] 처리 대상 ID: ${sliceItems.map((i) => i.id).join(", ")}`
  );

  // 2-3) 트랜잭션 BEGIN
  await client.query("BEGIN");
  console.log("  ▶ 트랜잭션 BEGIN");

  try {
    // 3) 기본 정보 upsert
    console.log("  ▶ 기본 정보 upsert 시작");
    const insertSql = `
      INSERT INTO news
        (id, title, content, thumbnail, published_at, source, tags, url)
      VALUES
        ($1, $2, $3, $4, to_timestamp($5), $6, $7, $8)
      ON CONFLICT (id) DO NOTHING;
    `;
    for (const it of sliceItems) {
      const tagsArr = it.tags
        ? it.tags
            .split("|")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
      await client.query(insertSql, [
        it.id,
        it.title,
        it.body,
        it.imageurl,
        it.published_on,
        it.source_name,
        tagsArr,
        it.url,
      ]);
      console.log(`    ✔ upsert 완료 id=${it.id}`);
    }

    // 4) 모델 분석 & 상세 업데이트
    console.log("  ▶ 모델 분석 및 상세 업데이트 시작");
    const updateSql = `
      UPDATE news
         SET title     = $1,
             summary   = $2,
             sentiment = $3,
             embedding = $4::vector
       WHERE id = $5;
    `;

    for (const it of sliceItems) {
      console.log(`    ▶ 모델 호출 id=${it.id}`);

      // 4-1) 모델 호출 시도
      let aiResult;
      try {
        aiResult = await summarizeArticle(it.title, it.body);
      } catch (e) {
        console.error(
          `[newsService] 모델 호출 오류 id=${it.id}:`,
          (e as Error).message
        );
        // 문제 있는 뉴스는 건너뛰고 다음으로
        continue;
      }

      // 4-2) 모델 내부 에러 표시 확인
      if ((aiResult as any).error) {
        console.error(
          `[newsService] 모델 응답 에러 id=${it.id}:`,
          (aiResult as any).error
        );
        continue;
      }

      console.log(
        `       ← 모델 응답 summary="${aiResult.summary.slice(
          0,
          30
        )}…" sentiment=${aiResult.sentiment}`
      );

      // 4-3) DB 업데이트 시도
      try {
        // [number,number,...] 형태 문자열로 변환
        const vectorLiteral = `[${aiResult.embedding.join(",")}]`;
        await client.query(updateSql, [
          aiResult.title,
          aiResult.summary,
          aiResult.sentiment,
          vectorLiteral,
          it.id,
        ]);
        console.log(`    ✔ 상세 업데이트 완료 id=${it.id}`);
      } catch (e) {
        console.error(
          `[newsService] DB 업데이트 오류 id=${it.id}:`,
          (e as Error).message
        );
        // 이 뉴스만 건너뛰고 계속
      }
    }

    // 5) COMMIT
    await client.query("COMMIT");
    console.log("  ▶ 트랜잭션 COMMIT");
    console.log("✅ 전체 뉴스 업데이트 완료");
  } catch (err) {
    console.error("❌ 트랜잭션 에러, ROLLBACK 수행", err);
    await client.query("ROLLBACK");
    throw err;
  }
}

/** 3) DB에서 뉴스 목록 조회 (summary/sentiment 포함) */
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

/** 4) DB에서 개별 뉴스 상세 조회 */
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

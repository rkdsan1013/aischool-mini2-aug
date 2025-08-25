import { client } from "../config/db";
import { embedText } from "./modelService";

export interface SimilarNewsItem {
  id: number;
  title: string;
  summary: string | null;
  content: string;
  thumbnail: string;
  sentiment: "positive" | "negative" | "neutral" | null;
  tags: string[];
  url: string | null;
  publishedAt: string;
  source: string;
  views: number;
  distance: number;
}

/**
 * 1) 사용자의 텍스트를 벡터화(embedText)
 * 2) news.embedding 컬럼과 cosine distance 계산
 * 3) 가까운 순서로 topK개 반환
 */
export async function searchRelevantNews(
  userInput: string,
  topK = 5
): Promise<SimilarNewsItem[]> {
  // 1) 질문 임베딩
  const embedding = await embedText(userInput);

  // 2) PG에 바인딩할 [..] 포맷 리터럴 생성
  const vectorLiteral = `[${embedding.join(",")}]`;

  // 3) pgvector <-> 연산자로 cosine distance 계산
  const sql = `
    SELECT
      id,
      title,
      summary,
      content,
      thumbnail,
      sentiment,
      tags,
      url,
      to_char(published_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "publishedAt",
      source,
      views,
      embedding <-> $1::vector AS distance
    FROM news
    ORDER BY distance
    LIMIT $2
  `;

  const { rows } = await client.query<SimilarNewsItem>(sql, [
    vectorLiteral,
    topK,
  ]);

  return rows;
}

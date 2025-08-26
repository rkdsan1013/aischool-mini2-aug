// backend/src/services/chatService.ts

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
 * 1) 사용자 질문을 embedText로 벡터화
 * 2) news.embedding과 cosine distance 계산 (operator: <=>)
 * 3) 가까운 순서로 topK개 반환
 */
export async function searchRelevantNews(
  userInput: string,
  topK = 5
): Promise<SimilarNewsItem[]> {
  // 1) 질문 임베딩
  let embedding = await embedText(userInput);

  // 1-1) (선택) 벡터 정규화: 코사인 연산 전 unit vector 권장
  const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  if (norm > 0) {
    embedding = embedding.map((v) => v / norm);
  }

  // 2) PG 바인딩용 리터럴 생성
  const vectorLiteral = `[${embedding.join(",")}]`;

  // 3) cosine distance 계산 쿼리 (<=>)
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
      embedding <=> $1::vector AS distance
    FROM news
    ORDER BY distance
    LIMIT $2;
  `;
  const { rows } = await client.query<SimilarNewsItem>(sql, [
    vectorLiteral,
    topK,
  ]);
  return rows;
}

// backend/src/services/modelService.ts

import axios from "axios";
import http from "http";
import https from "https";

//
// 1) 환경변수 또는 기본 ngrok URL 가져오기
// 2) https:// → http:// 로 치환, 끝 슬래시 제거
//
const RAW_BASE = (
  process.env.MODEL_BASE_URL?.trim() || "https://03a823d6c968.ngrok-free.app"
).replace(/\/+$/, "");

const BASE_HTTP = RAW_BASE.replace(/^https:\/\//, "http://");

// Python 테스트셀 timeout=(10,1200) 과 동일
const MODEL_TIMEOUT_MS = Number(process.env.MODEL_TIMEOUT_MS) || 1_200_000;

// HTTP/HTTPS 에이전트 (SSL 검증 비활성화)
const httpAgent = new http.Agent();
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export interface SummarizeResult {
  title: string;
  summary: string;
  sentiment: "positive" | "negative" | "neutral";
  embedding: number[];
}

export interface EmbeddingResult {
  embedding: number[];
}

/**
 * /summarize: 제목과 본문을 전달해
 * 요약·감정·임베딩을 반환받습니다.
 */
export async function summarizeArticle(
  title: string,
  body: string
): Promise<SummarizeResult> {
  const url = `${BASE_HTTP}/summarize`;
  console.log("[modelService] POST →", url);

  try {
    const response = await axios.post<SummarizeResult>(
      url,
      { title, body },
      {
        timeout: MODEL_TIMEOUT_MS,
        httpAgent,
        httpsAgent,
        maxRedirects: 5,
      }
    );

    console.log(
      `[modelService] summarize status=${response.status}`,
      response.data
    );
    if (response.status !== 200) {
      throw new Error(`summarize failed: ${response.status}`);
    }
    return response.data;
  } catch (err: any) {
    console.error(
      "[modelService] summarize error:",
      err.code,
      err.response?.status,
      err.message
    );
    throw err;
  }
}

/**
 * /embedding: 단일 텍스트를 전달해
 * embedding 벡터만 반환받습니다.
 */
export async function embedText(text: string): Promise<number[]> {
  const url = `${BASE_HTTP}/embedding`;
  console.log("[modelService] POST →", url);

  try {
    const response = await axios.post<EmbeddingResult>(
      url,
      { text },
      {
        timeout: MODEL_TIMEOUT_MS,
        httpAgent,
        httpsAgent,
        maxRedirects: 5,
      }
    );

    console.log(
      `[modelService] embedding status=${response.status}`,
      response.data
    );
    if (response.status !== 200) {
      throw new Error(`embedText failed: ${response.status}`);
    }
    return response.data.embedding;
  } catch (err: any) {
    console.error(
      "[modelService] embedText error:",
      err.code,
      err.response?.status,
      err.message
    );
    throw err;
  }
}

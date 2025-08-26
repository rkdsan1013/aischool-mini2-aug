import axios from "axios";
import http from "http";
import https from "https";

// 모델 서버 베이스 URL 설정
const RAW_BASE = (
  process.env.MODEL_BASE_URL?.trim() || "https://6ccf4f8b38b9.ngrok-free.app"
).replace(/\/+$/, "");
const BASE_HTTP = RAW_BASE.replace(/^https:\/\//, "http://");
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

export interface ChatbotResult {
  response: string;
}

/**
 * /summarize: 제목 + 본문을 보내면 요약·감정·임베딩 반환
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
      { timeout: MODEL_TIMEOUT_MS, httpAgent, httpsAgent, maxRedirects: 5 }
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
 * /embedding: 단일 텍스트를 보내면 임베딩 벡터만 반환
 */
export async function embedText(text: string): Promise<number[]> {
  const url = `${BASE_HTTP}/embedding`;
  console.log("[modelService] POST →", url);

  try {
    const response = await axios.post<EmbeddingResult>(
      url,
      { text },
      { timeout: MODEL_TIMEOUT_MS, httpAgent, httpsAgent, maxRedirects: 5 }
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

/**
 * /chatbot: 질문 + 컨텍스트를 보내면 AI 응답 반환
 */
export async function chatWithContext(
  question: string,
  context: string
): Promise<ChatbotResult> {
  const url = `${BASE_HTTP}/chatbot`;
  console.log("[modelService] POST →", url);

  try {
    const response = await axios.post<ChatbotResult>(
      url,
      { question, context },
      { timeout: MODEL_TIMEOUT_MS, httpAgent, httpsAgent, maxRedirects: 5 }
    );
    console.log(
      `[modelService] chatWithContext status=${response.status}`,
      response.data
    );
    if (response.status !== 200) {
      throw new Error(`chatWithContext failed: ${response.status}`);
    }
    return response.data;
  } catch (err: any) {
    console.error(
      "[modelService] chatWithContext error:",
      err.code,
      err.response?.status,
      err.message
    );
    throw err;
  }
}

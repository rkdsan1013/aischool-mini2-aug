// backend/src/services/modelService.ts

import axios from "axios";
import http from "http";
import https from "https";

/**
 * Colab 테스트 셀과 똑같은 환경으로 ngrok HTTP 터널 호출을 재현합니다.
 *
 * 1) process.env.MODEL_BASE_URL 또는 하드코딩된 ngrok URL을 가져와
 *    trim()으로 앞뒤 공백/제어문자 제거, 슬래시(/)를 없앱니다.
 * 2) https:// → http:// 로 치환. Python requests 테스트가 이 HTTP URL을 쓰고
 *    307 리다이렉트를 자동 추종하기 때문에 동일 동작을 합니다.
 */
const RAW_BASE = (
  process.env.MODEL_BASE_URL ?? "https://45fd69322357.ngrok-free.app"
)
  .trim()
  .replace(/\/+$/, "");

// Python 테스트셀: http_url = public_url.replace("https://", "http://")
const BASE_HTTP = RAW_BASE.replace(/^https:\/\//, "http://");

// Python 테스트셀 timeout=(10,1200) 과 동일하게,
// connect 최대 10초, 총 read 최대 1200초(20분)를 보장하기 위해
// axios의 단일 timeout을 충분히 크게 설정합니다.
const MODEL_TIMEOUT_MS = Number(process.env.MODEL_TIMEOUT_MS) || 1_200_000;

// HTTP 터널 전용 에이전트 (verify=False처럼 SSL 인증 무시는 httpsAgent에서)
const httpAgent = new http.Agent();
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export interface SummarizeResult {
  title: string; // 모델이 echo 해주는 title
  summary: string; // 요약 텍스트
  sentiment: "positive" | "negative" | "neutral"; // 감정 분석 결과
  embedding: number[]; // 768차원 벡터
}

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
        // Colab의 requests는 기본적으로 307을 따라가므로
        // axios도 리다이렉트(307→HTTPS) 5회까지 허용합니다.
        maxRedirects: 5,
      }
    );

    console.log(`[modelService] 응답 상태: ${response.status}`, response.data);

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

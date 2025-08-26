// src/services/chatService.ts

import { post } from "./apiClient";

export interface ChatRequest {
  question: string;
}

// 실제 백엔드가 반환하는 필드명 그대로 정의
interface BackendChatResponse {
  response: string;
  context?: Array<{
    id: number;
    title: string;
    summary: string | null;
    distance: number;
  }>;
}

// 화면 컴포넌트에서 기대하는 필드명으로 매핑된 타입
export interface ChatResponse {
  answer: string;
  context?: BackendChatResponse["context"];
}

/**
 * 백엔드 /api/chat 엔드포인트 호출
 * - question: 사용자가 입력한 자연어
 * - returns:
 *    answer (모델이 생성한 응답 텍스트),
 *    context (선택, RAG에 사용된 문서 메타정보)
 */
export async function sendChat(question: string): Promise<ChatResponse> {
  // 1) 백엔드에 요청
  const apiRes = await post<BackendChatResponse>("/api/chat", { question });

  // 2) backend의 response → answer 로 매핑하여 반환
  return {
    answer: apiRes.response,
    context: apiRes.context,
  };
}

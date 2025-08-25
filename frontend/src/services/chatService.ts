// src/services/chatService.ts

import { post } from "./apiClient";

export interface ChatRequest {
  question: string;
}

export interface ChatResponse {
  answer: string;
  // (선택) RAG에 사용된 문서 메타정보가 필요하면 포함시켜도 좋습니다
  context?: Array<{
    id: number;
    title: string;
    summary: string | null;
    distance: number;
  }>;
}

/**
 * 백엔드 /api/chat 엔드포인트 호출
 * question: 사용자가 입력한 자연어
 * returns: answer(모델이 생성한 응답 텍스트)
 */
export function sendChat(question: string): Promise<ChatResponse> {
  return post<ChatResponse>("/api/chat", { question });
}

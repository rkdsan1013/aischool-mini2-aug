import { chatWithContext } from "./modelService";

/**
 * 질문 + 컨텍스트를 모델에 전달해 최종 챗봇 응답을 반환
 */
export async function generateChatbotAnswer(
  question: string,
  context: string
): Promise<string> {
  const result = await chatWithContext(question, context);
  return result.response;
}

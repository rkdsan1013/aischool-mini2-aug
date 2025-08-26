import { Router, Request, Response } from "express";
import { searchRelevantNews, SimilarNewsItem } from "../services/chatService";
import { generateChatbotAnswer } from "../services/chatbotService";

interface ChatRequest {
  question: string;
}
interface ChatResponse {
  response: string;
  // optionally return the context we used for debugging
  context?: string;
  message?: string;
}

const router = Router();

/**
 * POST /api/chat
 * body: { question }
 * → 1) 질문 임베딩 & 벡터 검색
 *   2) 검색 결과 로그 & 컨텍스트 문자열 조립
 *   3) 모델에 question + context 전송
 *   4) 최종 response 반환
 */
router.post(
  "/",
  async (req: Request<{}, {}, ChatRequest>, res: Response<ChatResponse>) => {
    const { question } = req.body;

    try {
      // 1) 벡터 검색
      const docs: SimilarNewsItem[] = await searchRelevantNews(question, 5);

      // 2) 검색 결과 로그
      console.log(
        "🔍 벡터 검색 결과:",
        docs.map((d) => ({
          id: d.id,
          title: d.title,
          distance: d.distance.toFixed(4),
        }))
      );

      // 3) 컨텍스트 텍스트 생성 (제목 + 요약)
      const contextText = docs
        .map((d) => `${d.title}\n${d.summary ?? ""}`)
        .join("\n\n");

      // 4) 챗봇 모델 호출
      const responseText = await generateChatbotAnswer(question, contextText);

      // 5) 결과 반환 (디버깅용으로 context도 함께 반환 가능)
      return res.json({
        response: responseText,
        context: contextText,
      });
    } catch (err: any) {
      console.error("❌ /api/chat 흐름 에러:", err);
      return res.status(500).json({
        response: "",
        message: "챗봇 처리 중 오류가 발생했습니다.",
      });
    }
  }
);

export default router;

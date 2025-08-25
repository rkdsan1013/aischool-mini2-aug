// backend/src/routes/chatRoutes.ts

import { Router, Request, Response } from "express";
import { searchRelevantNews, SimilarNewsItem } from "../services/chatService";

interface ChatRequestBody {
  question: string;
}

interface SimplifiedContextItem {
  title: string;
  summary: string | null;
  tags: string[];
  publishedAt: string;
}

interface ContextResponse {
  context: SimplifiedContextItem[];
}

const router = Router();

router.post(
  "/",
  async (
    req: Request<{}, {}, ChatRequestBody>,
    res: Response<ContextResponse | { message: string }>
  ) => {
    const { question } = req.body;

    try {
      // 1) 벡터 검색으로 유사 문서 가져오기
      const contextDocs: SimilarNewsItem[] = await searchRelevantNews(
        question,
        5
      );

      // 2) 필터링 전 전체 컨텍스트 + 거리 로그
      console.log(
        "🔍 필터링 전 컨텍스트:",
        contextDocs.map((doc) => ({
          title: doc.title,
          distance: doc.distance,
        }))
      );

      // 3) distance 컷오프 적용 (예: 0.5)
      const filtered = contextDocs.filter((doc) => doc.distance <= 0.5);

      // 4) 필요한 항목만 추출
      const simplified: SimplifiedContextItem[] = filtered.map((doc) => ({
        title: doc.title,
        summary: doc.summary,
        tags: doc.tags,
        publishedAt: doc.publishedAt,
      }));

      // 5) 필터링 후 컨텍스트 로그
      console.log("🔍 필터링 후 컨텍스트:", simplified);

      // 6) 클라이언트에 반환
      return res.json({ context: simplified });
    } catch (err: any) {
      console.error("❌ 벡터 검색 에러:", err);
      return res
        .status(500)
        .json({ message: "벡터 검색 중 오류가 발생했습니다." });
    }
  }
);

export default router;

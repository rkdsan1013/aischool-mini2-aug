// backend/src/routes/newsRoutes.ts

import { Router } from "express";
import {
  fetchCryptoNews,
  updateCryptoNews,
  getNewsList,
  getNewsDetail,
  deleteAllNews,
  incrementNewsViews,
} from "../services/newsService";

const router = Router();

// GET  /news/fetch → 외부 API에서 원본 뉴스 데이터만 반환
router.get("/fetch", async (_req, res) => {
  try {
    const items = await fetchCryptoNews();
    res.json(items);
  } catch (err) {
    console.error("GET /news/fetch Error:", err);
    res.status(500).json({ message: "외부 뉴스 API 호출 실패" });
  }
});

// POST /news/fetch → DB 저장 + 모델 분석·업데이트 (개발자 모드)
router.post("/fetch", async (_req, res) => {
  try {
    await updateCryptoNews();
    res.json({ success: true, message: "뉴스 갱신 완료" });
  } catch (err) {
    console.error("POST /news/fetch Error:", err);
    res.status(500).json({ message: "뉴스 저장 실패" });
  }
});

// DELETE /news → 모든 뉴스 삭제 (개발자 모드)
router.delete("/", async (_req, res) => {
  try {
    await deleteAllNews();
    res.json({ success: true, message: "모든 뉴스 삭제 완료" });
  } catch (err) {
    console.error("DELETE /news Error:", err);
    res.status(500).json({ message: "뉴스 삭제 실패" });
  }
});

// GET  /news → 뉴스 목록 조회 (summary, sentiment 포함)
router.get("/", async (_req, res) => {
  try {
    const list = await getNewsList();
    res.json(list);
  } catch (err) {
    console.error("GET /news Error:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// GET  /news/:id → 개별 뉴스 상세 조회 (summary, sentiment 포함)
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "잘못된 ID" });
  }

  try {
    // 조회수 증가
    await incrementNewsViews(id);

    // 상세 데이터 조회
    const detail = await getNewsDetail(id);
    if (!detail) {
      return res.status(404).json({ message: "뉴스를 찾을 수 없습니다." });
    }
    res.json(detail);
  } catch (err) {
    console.error(`GET /news/${id} Error:`, err);
    res.status(500).json({ message: "서버 오류" });
  }
});

export default router;

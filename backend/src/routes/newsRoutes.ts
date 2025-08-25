// backend/src/routes/newsRoutes.ts
import { Router } from "express";
import { client } from "../config/db";
import { fetchCryptoNews } from "../services/newsService";

const router = Router();

// 1) 외부 API 뉴스 수집
router.get("/fetch", async (_req, res) => {
  try {
    const items = await fetchCryptoNews();
    res.json(items);
  } catch (err) {
    console.error("❌ /news/fetch API Error:", err);
    res.status(500).json({ message: "외부 뉴스 API 호출 실패" });
  }
});

// 2) 개별 뉴스 조회 (id는 정수)
router.get("/:id", async (req, res) => {
  const idNum = parseInt(req.params.id, 10);
  if (isNaN(idNum)) {
    return res.status(400).json({ message: "잘못된 뉴스 ID입니다." });
  }

  try {
    const result = await client.query(
      `SELECT
         id,
         title,
         summary,
         content,
         thumbnail,
         sentiment,
         published_at AS "publishedAt",
         source,
         tags,
         url
       FROM news
       WHERE id = $1`,
      [idNum]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "뉴스를 찾을 수 없습니다." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(`❌ /news/${idNum} API Error:`, err);
    res.status(500).json({ message: "서버 오류" });
  }
});

// 3) 전체 뉴스 조회
router.get("/", async (_req, res) => {
  try {
    const result = await client.query(
      `SELECT
         id,
         title,
         summary,
         thumbnail,
         sentiment,
         published_at AS "publishedAt",
         source
       FROM news
       ORDER BY published_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ /news API Error:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

export default router;

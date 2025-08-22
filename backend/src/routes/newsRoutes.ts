import { Router } from "express";
import { client } from "../config/db";

const router = Router();

// GET /news - 뉴스 목록 조회
router.get("/", async (req, res) => {
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

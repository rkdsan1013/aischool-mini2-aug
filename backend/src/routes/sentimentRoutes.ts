import { Router } from "express";
import { client } from "../config/db";

const router = Router();

// 최근 24시간 동안 긍정/부정 뉴스 목록 (최대 20건)
router.get("/news", async (req, res) => {
  try {
    const { rows } = await client.query<{
      id: number;
      title: string;
      sentiment: "positive" | "negative";
      publishedAt: string;
    }>(`
      SELECT
        id,
        title,
        sentiment,
        to_char(
          published_at,
          'YYYY-MM-DD"T"HH24:MI:SS"Z"'
        ) AS "publishedAt"
      FROM news
      WHERE sentiment IN ('positive','negative')
        AND published_at >= NOW() - INTERVAL '24 hours'
      ORDER BY published_at DESC
      LIMIT 20;
    `);

    res.json(rows);
  } catch (e) {
    console.error("GET /api/sentiment/news error:", e);
    res.status(500).json({ message: "감성 뉴스 조회 중 오류가 발생했습니다." });
  }
});

// 지난 기간(range)에 대한 감성 통계
// query: ?range=24h | 7d | 30d
router.get("/stats", async (req, res) => {
  try {
    const range = (req.query.range as string) || "24h";
    const interval =
      range === "7d" ? "7 days" : range === "30d" ? "30 days" : "24 hours";

    const { rows } = await client.query<{
      positive: number;
      negative: number;
      neutral: number;
    }>(`
      SELECT
        COUNT(*) FILTER (WHERE sentiment = 'positive') AS positive,
        COUNT(*) FILTER (WHERE sentiment = 'negative') AS negative,
        COUNT(*) FILTER (WHERE sentiment = 'neutral')  AS neutral
      FROM news
      WHERE published_at >= NOW() - INTERVAL '${interval}';
    `);

    res.json(rows[0]);
  } catch (e) {
    console.error("GET /api/sentiment/stats error:", e);
    res.status(500).json({ message: "감성 통계 조회 중 오류가 발생했습니다." });
  }
});

export default router;

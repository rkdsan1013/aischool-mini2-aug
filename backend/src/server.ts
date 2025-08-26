import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import newsRoutes from "./routes/newsRoutes";
import sentimentRoutes from "./routes/sentimentRoutes";
import chatRoutes from "./routes/chatRoutes";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;

// 1) 미들웨어
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// 2) 헬스체크
app.get("/", (_req: Request, res: Response) => {
  res.send("Backend API is running!");
});

// 3) API 라우트
app.use("/news", newsRoutes);
app.use("/api/sentiment", sentimentRoutes);

// /api/chat/search  → 벡터 검색
// /api/chat         → 챗봇 대화
app.use("/api/chat", chatRoutes);

// 4) 404 핸들러
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "요청하신 경로를 찾을 수 없습니다." });
});

// 5) 에러 핸들러
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "서버 오류가 발생했습니다." });
});

// 6) 서버 시작 전 DB 연결 보장
async function start() {
  try {
    await connectDB();
    app.listen(PORT, () =>
      console.log(`🚀 Backend running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Failed to connect to DB or start server:", err);
    process.exit(1);
  }
}

start();

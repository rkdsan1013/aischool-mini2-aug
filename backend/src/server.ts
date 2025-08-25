import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import newsRoutes from "./routes/newsRoutes";

const app = express();
const PORT = process.env.PORT || 8000;

// CORS 설정
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// JSON 파싱
app.use(express.json());

// DB 연결
connectDB();

// 헬스체크
app.get("/", (_req, res) => {
  res.send("Backend API is running!");
});

// 뉴스 관련 라우트
app.use("/news", newsRoutes);

// 404 핸들러
app.use((_req, res) => {
  res.status(404).json({ message: "요청하신 경로를 찾을 수 없습니다." });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});

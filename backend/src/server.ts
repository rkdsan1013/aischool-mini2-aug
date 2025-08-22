import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import newsRoutes from "./routes/newsRoutes";

const app = express();
const PORT = process.env.PORT || 8000;

// ===== CORS 설정 =====
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ===== JSON 파싱 =====
app.use(express.json());

// ===== DB 연결 (docker-compose healthcheck + 재시도 로직으로 안정화) =====
connectDB();

// ===== 기본 라우트 =====
app.get("/", (req, res) => {
  res.send("Backend API is running!");
});

// ===== 뉴스 라우트 등록 =====
app.use("/news", newsRoutes);

// ===== 서버 실행 =====
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});

import { Client } from "pg";

export const client = new Client({
  host: process.env.DB_HOST || "db", // docker-compose service name
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "mydb",
});

/**
 * DB 연결 (재시도 로직 포함)
 * @param retries 재시도 횟수
 * @param delay   재시도 간격(ms)
 */
export const connectDB = async (retries = 5, delay = 5000) => {
  while (retries) {
    try {
      await client.connect();
      console.log("✅ Connected to PostgreSQL");
      break;
    } catch (err) {
      console.error(`❌ DB Connection Error: ${err}`);
      retries -= 1;
      if (!retries) {
        console.error("🚨 DB 연결 재시도 횟수 초과. 서버를 종료합니다.");
        process.exit(1);
      }
      console.log(`⏳ ${delay / 1000}초 후 재시도... (남은 횟수: ${retries})`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

import { Client } from "pg";

export const client = new Client({
  host: process.env.DB_HOST || "db",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "mydb",
});

/**
 * DB 연결 (재시도 로직 포함)
 */
export const connectDB = async (retries = 5, delay = 5000): Promise<void> => {
  while (retries > 0) {
    try {
      await client.connect();
      console.log("✅ Connected to PostgreSQL");
      return;
    } catch (err) {
      console.error(`❌ DB Connection Error: ${err}`);
      retries -= 1;
      if (retries === 0) {
        console.error("🚨 DB 연결 재시도 초과. 프로세스를 종료합니다.");
        process.exit(1);
      }
      console.log(`⏳ ${delay / 1000}s 후 재시도... (남은 횟수: ${retries})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
};

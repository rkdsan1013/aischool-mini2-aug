// backend/src/config/db.ts

import { Client } from "pg";
import pgvector from "pgvector/pg";

export const client = new Client({
  host: process.env.DB_HOST || "db",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "mydb",
});

/**
 * DB 연결 (재시도 로직 포함)
 * 연결 후 vector 확장 설치 및 pgvector 타입 등록을 수행합니다.
 */
export const connectDB = async (retries = 5, delay = 5000): Promise<void> => {
  while (retries > 0) {
    try {
      await client.connect();
      console.log("✅ Connected to PostgreSQL");

      // 1) vector 확장 설치 (없으면 생성)
      await client.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
      console.log("✅ PostgreSQL vector extension enabled");

      // 2) pgvector 타입 파서 등록
      await pgvector.registerType(client);
      console.log("✅ pgvector type registered");

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

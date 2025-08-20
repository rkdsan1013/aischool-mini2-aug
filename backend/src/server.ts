import express from "express";
import { Client } from "pg";

const app = express();
const PORT = process.env.PORT || 8000;

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

client
  .connect()
  .then(() => {
    console.log("✅ Connected to PostgreSQL");
  })
  .catch((err) => {
    console.error("❌ DB Connection Error", err);
  });

app.get("/", (req, res) => {
  res.send("Backend API is running!");
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});

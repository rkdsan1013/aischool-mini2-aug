import express, { Request, Response } from "express";

const app = express();
const PORT = 3000;

app.get("/ping", (_req: Request, res: Response) => {
  res.send("hello world");
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});

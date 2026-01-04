import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
// Import router from compiled server folder; paths must align after build
import aiRouter from "./src/server/aiEndpoint.js";

// Only load .env locally; in Railway/Vercel we rely on platform env
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
} else {
  console.log("[server] Skipping dotenv in production");
}

const app = express();
const PORT = Number(process.env.PORT || 8080);

console.log("[server] Starting server with PORT:", PORT);
console.log("[server] OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✓ set" : "✗ not set");
console.log("[server] DATABASE_URL:", process.env.DATABASE_URL ? "✓ set" : "✗ not set");

app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Debug middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`[server] ${req.method} ${req.path}`);
  console.log("[server] headers:", req.headers);
  console.log("[server] body:", req.body);
  next();
});

app.use("/api/ai", aiRouter);
console.log("[server] Mounted /api/ai router");

app.get("/api/health", (req, res) => {
  console.log("[server] Health check requested");
  res.json({ ok: true });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] StudyBuddy server running on port ${PORT}`);
  console.log(`[server] Ready to accept requests at http://0.0.0.0:${PORT}`);
});

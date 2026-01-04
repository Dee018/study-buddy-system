import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
// Import router from compiled server folder; paths must align after build
import aiRouter from "./src/server/aiEndpoint.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/ai", aiRouter);

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`StudyBuddy server running on port ${PORT}`);
});

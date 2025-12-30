import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

// Load .env early so downstream modules (like aiEndpoint) see env vars
dotenv.config();

const startServer = async () => {
  try {
    const app = express();
    const PORT = process.env.PORT || 4000;

    app.use(cors());
    app.use(bodyParser.json({ limit: "1mb" }));
    app.use(bodyParser.urlencoded({ extended: true }));

    // Import router after dotenv.config() so environment variables are available
    const { default: aiRouter } = await import("./aiEndpoint.js");
    app.use("/api/ai", aiRouter);

    app.get("/api/health", (req, res) => res.json({ ok: true }));

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`StudyBuddy server running on port ${PORT}`);
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error('Failed to start server:', err.stack);
    } else {
      console.error('Failed to start server:', err);
    }
    process.exit(1);
  }
};

process.on('uncaughtException', (err) => {
  if (err instanceof Error) console.error('Uncaught exception:', err.stack);
  else console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason) => {
  if (reason instanceof Error) console.error('Unhandled rejection:', reason.stack);
  else console.error('Unhandled rejection:', reason);
});

startServer();

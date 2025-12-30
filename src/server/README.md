# StudyBuddy Server (AI Endpoint)

Quick notes for running the AI server locally.

Environment variables required:
- `DATABASE_URL` — Postgres connection string used by the server (required)
- `OPENAI_API_KEY` — OpenAI API key (required) or set `OPENAI_API_ENDPOINT` for alternative provider
- `OPENAI_MODEL` — optional (default: `gpt-4o-mini`)
- `PORT` — optional (default: 4000)

Install dependencies:

```powershell
npm install
npm install pg body-parser dotenv --save
npm install --save-dev ts-node ts-node-dev @types/express @types/cors @types/body-parser @types/pg
```

Run in development (auto-restart):

```powershell
npm run start:server:dev
```

Build and run production (compile first):

```powershell
npm run build:server
node dist/server/index.js
```

Healthcheck: GET /api/health

The AI endpoint is mounted at: POST /api/ai/respond
Request body: `{ userId: string, userMessage: string, userLevel?: string }`

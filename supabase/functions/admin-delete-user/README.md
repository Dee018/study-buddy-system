# admin-delete-user (Supabase Edge Function)

Purpose
- Safely delete a user from Supabase (Auth + DB) using the service role key.
- Archives a record into `deleted_users` and removes related rows (`user_profiles`, `user_accounts`, `user_progress`, `user_passwords`).

Important
- This function requires the Supabase service role key and must be deployed to Supabase Edge Functions. Do NOT expose the service role key to the client.
- NOTE: The Supabase CLI will refuse to set secret names that start with `SUPABASE_`. Use the secret name `SERVICE_ROLE_KEY` instead when running `supabase secrets set` (the function will accept either `SUPABASE_SERVICE_ROLE_KEY` or `SERVICE_ROLE_KEY`).
- For local development use the provided mock server `supabase/functions/local-admin-delete-server.js` (DEV-ONLY). The mock does not delete real data.

Deploy
1. Login & link to your project:
```bash
npx supabase@latest login
npx supabase@latest link --project-ref YOUR_PROJECT_REF
```
2. Deploy the function:
```bash
npx supabase@latest functions deploy admin-delete-user --project-ref YOUR_PROJECT_REF
```
3. Set required secrets for the function (in Supabase project):
```bash
# The CLI disallows `SUPABASE_`-prefixed secret names; set `SERVICE_ROLE_KEY` instead.
npx supabase@latest secrets set SERVICE_ROLE_KEY="<your_service_role_key>" ADMIN_SECRET="<some_admin_secret>" --project-ref YOUR_PROJECT_REF
```

Required environment variables (function runtime)
- `SUPABASE_URL` – your Supabase URL (automatically set when deploying via CLI)
- `SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_ROLE_KEY` – **REQUIRED** (server-only secret). Use `SERVICE_ROLE_KEY` when setting via CLI.
- `ADMIN_SECRET` – **REQUIRED** for this function; callers must present this value in the `x-admin-secret` header.

Example request (client)
```http
POST /functions/v1/admin-delete-user
Content-Type: application/json
x-admin-secret: <your-admin-secret>

{
  "userId": "a476570f-da0b-41ca-912a-06cbe9bd81e4",
  "reason": "Removed by admin in UI"
}
```

Response
- Success: `200` with `{ ok: true, results: { ... } }` describing archive and deletion results.
- Failure: `4xx/5xx` with `{ error: "...", details: "..." }`.

- To test without deploying (DEV ONLY), run the mock server:
Local development
- To test without deploying (DEV ONLY), run the mock server:
- To test without deploying (DEV ONLY), run the mock server:
```bash
# install dev dependencies once
npm install express cors

# start mock (listens on http://localhost:54321)
npm run mock:functions
```
-- The mock validates `x-admin-secret` if provided and returns a simulated success. It does NOT modify Supabase.

Security notes
- Never store the service role key in client-side code or commit it to source control. If you accidentally exposed a service role key (for example by pasting it into a terminal or chat), rotate it immediately in the Supabase Dashboard (`Project Settings -> API -> Service Key`), then update your function secrets.
- Prefer using `x-admin-secret` for internal server calls or validate caller JWT + `user_profiles.is_admin` on the server side.

Support
- If you need a Node/Express variant or example GitHub Actions deploy, open an issue in this repo or ask the dev to add it.

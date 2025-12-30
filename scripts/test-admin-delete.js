import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_SECRET = Deno.env.get("ADMIN_SECRET")!;

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";
  const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") || "").split(",").map(s => s.trim());
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : "";

  const reply = (body: any, status = 200) => {
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Access-Control-Allow-Headers", "Content-Type, x-admin-secret, Authorization");
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    if (allowedOrigin) headers.set("Access-Control-Allow-Origin", allowedOrigin);
    return new Response(JSON.stringify(body), { status, headers });
  };

  if (req.method === "OPTIONS") return reply({}, 204);
  if (req.method !== "POST") return reply({ ok: false, error: "Method Not Allowed" }, 405);

  // Check admin secret
  const provided = req.headers.get("x-admin-secret");
  if (!provided || provided !== ADMIN_SECRET) return reply({ ok: false, error: "Unauthorized" }, 401);

  const body = await req.json().catch(() => ({}));
  const userId: string | undefined = body?.userId;
  if (!userId) return reply({ ok: false, error: "Missing userId" }, 400);

  try {
    // 1️⃣ Remove Auth user (using service role)
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId);
    if (authError) console.warn("Auth user deletion failed or already deleted:", authError.message);

    // 2️⃣ Remove from deleted_users table
    const { data, error } = await adminClient.from("deleted_users").delete().eq("user_id", userId).select();
    if (error) return reply({ ok: false, error: error.message }, 500);

    return reply({ ok: true, deletedCount: Array.isArray(data) ? data.length : 0 });
  } catch (err) {
    return reply({ ok: false, error: String(err) }, 500);
  }
});

/*
 * Supabase Edge Function: admin-delete-user
 * Deletes Auth user, archives into deleted_users, and removes related DB rows.
 * Requires SUPABASE_SERVICE_ROLE_KEY and ADMIN_SECRET in env.
 */

import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY") || "";
const ADMIN_SECRET = Deno.env.get("ADMIN_SECRET") || "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. This function requires the service role key.");
}

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

serve(async (req: Request) => {
  // CORS and response helper
  const allowedOriginsEnv = Deno.env.get('ALLOWED_ORIGINS') || '';
  const allowedOrigins = (allowedOriginsEnv ? allowedOriginsEnv.split(',') : []).map(s => s.trim()).filter(Boolean);
  // default dev origins
  const defaultOrigins = ['http://localhost:5173', 'http://localhost:3000'];
  const extraFrontend = Deno.env.get('FRONTEND_URL');
  if (extraFrontend) allowedOrigins.push(extraFrontend.trim());
  const origins = Array.from(new Set([...allowedOrigins, ...defaultOrigins]));

  const origin = req.headers.get('origin') || '';
  const allowedOrigin = origins.includes(origin) ? origin : null;

  const reply = (body: any, status = 200) => {
    const headers = new Headers();
    headers.set('Content-Type', typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, x-admin-secret, Authorization');
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Vary', 'Origin');
    if (allowedOrigin) headers.set('Access-Control-Allow-Origin', allowedOrigin);
    const out = typeof body === 'string' ? body : JSON.stringify(body);
    return new Response(out, { status, headers });
  };

  try {
    // Handle preflight
    if (req.method === 'OPTIONS') {
      return reply('', 204);
    }
    if (req.method !== 'POST') return reply('Method Not Allowed', 405);

    // Enforce admin access via a shared secret header `x-admin-secret`.
    const headers = req.headers;
    const provided = headers.get("x-admin-secret");
    if (!ADMIN_SECRET) {
      console.error("ADMIN_SECRET not configured for admin-delete-user function");
      return reply({ ok: false, step: 'auth', error: 'server misconfiguration' }, 500);
    }
    if (!provided || provided !== ADMIN_SECRET) {
      console.warn("admin-delete-user: invalid or missing x-admin-secret header");
      return reply({ ok: false, step: 'auth', error: 'missing or invalid admin secret' }, 401);
    }
    console.log("admin-delete-user: admin secret validated (auth passed)");
    const actorId = "service-admin";

    const body = await req.json().catch(() => ({}));
    const userId: string | undefined = body?.userId;
    const reason: string | undefined = body?.reason;
    const deletedBy: string | null = body?.deletedBy ?? null;

    if (!userId) {
      return reply({ ok: false, step: 'validation', error: 'missing userId' }, 400);
    }

    // Fetch user info from user_profiles to fill required deleted_users columns
    const { data: userRowRaw, error: fetchErr } = await adminClient
      .from("user_profiles")
      .select("id, uuid, username, email")
      .eq("id", userId)
      .single();

    // If the user profile row is missing, proceed with a minimal archive payload
    // so we can still remove the Auth user. Make archival non-fatal.
    let userRow: any = userRowRaw;
    if (fetchErr || !userRow) {
      console.warn('admin-delete-user: user_profiles row not found; proceeding with minimal archive for user:', userId);
      userRow = { uuid: null, username: null, email: null };
    }

    const deletedAt = new Date().toISOString();
    const archivePayload = {
      user_id: userId,
      uuid: userRow.uuid,
      username: userRow.username,
      email: userRow.email,
      deleted_by: deletedBy,
      reason: reason ?? null,
      deleted_at: deletedAt
    };

    const results: Record<string, any> = { archived: null, deleted_tables: {}, auth_deleted: null };

    // Archive into deleted_users
    // Attempt to archive into `deleted_users` but do not abort if this fails.
    try {
      const { data: archived, error: insertErr } = await adminClient
        .from("deleted_users")
        .insert(archivePayload)
        .select()
        .single();

      if (insertErr) {
        console.warn('admin-delete-user: failed to insert into deleted_users, continuing:', insertErr.message);
        results.archived = null;
      } else {
        results.archived = archived;
      }
    } catch (e) {
      console.warn('admin-delete-user: unexpected error inserting into deleted_users, continuing:', String(e));
      results.archived = null;
    }

    // Delete related rows (best-effort)
    const tables = [
      { name: "user_progress", col: "user_id" },
      { name: "user_passwords", col: "user_id" },
      { name: "user_accounts", col: "user_id" }, // fixed column name
      { name: "user_profiles", col: "id" },      // fixed column name
    ];

    for (const t of tables) {
      const { error: delErr, data: delData } = await adminClient.from(t.name).delete().eq(t.col, userId).select();
      if (delErr) {
        return reply({ ok: false, step: `delete_table:${t.name}`, error: delErr.message, results }, 500);
      }
      results.deleted_tables[t.name] = { ok: true, rows: delData?.length ?? 0 };
    }

    // Delete Auth user
    const { error: deleteAuthErr } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteAuthErr) {
      results.auth_deleted = { ok: false, error: deleteAuthErr.message };
      return reply({ ok: false, step: 'auth_delete', error: deleteAuthErr.message, results }, 500);
    }
    results.auth_deleted = { ok: true };

    return reply({ ok: true, results }, 200);
  } catch (err) {
    return reply({ ok: false, step: 'internal', error: String(err) }, 500);
  }
});

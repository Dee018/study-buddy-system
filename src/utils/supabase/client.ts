/**
 * Supabase Client Configuration
 * Fully RLS-ready with UUID mapping
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey, rawSupabaseUrl } from './info';

const isConfigured = !!projectId && !!publicAnonKey;
const supabaseUrl = rawSupabaseUrl || (projectId ? `https://${projectId}.supabase.co` : '');

function makeNoopRes() {
  return Promise.resolve({ data: null, error: new Error('Supabase not configured') });
}

function makeNoopFrom() {
  return {
    select: () => makeNoopRes(),
    insert: () => makeNoopRes(),
    update: () => makeNoopRes(),
    delete: () => makeNoopRes(),
    upsert: () => makeNoopRes(),
    limit: () => ({ select: () => makeNoopRes() }),
    order: () => ({ select: () => makeNoopRes() }),
    eq: () => ({ select: () => makeNoopRes() })
  } as any;
}

let _supabase: SupabaseClient | null = null;

if (isConfigured) {
  try {
    _supabase = createClient(supabaseUrl, publicAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'study_buddy_supabase_auth',
      },
      realtime: {
        params: { eventsPerSecond: 10 }
      }
    });
  } catch (err) {
    console.warn('Failed to initialize Supabase client, falling back to noop client:', err);
    _supabase = null;
  }
}

// Exported Supabase client (or noop fallback)
export const supabase: SupabaseClient = _supabase || ({
  from: (_: string) => makeNoopFrom(),
  rpc: () => makeNoopRes(),
  auth: {
    signIn: () => makeNoopRes(),
    signOut: () => makeNoopRes(),
    getUser: () => makeNoopRes(),
  },
  storage: { from: () => ({ getPublicUrl: () => ({ publicURL: '' }) }) }
} as any);

// Attach the client to globalThis in development for easy console debugging.
// Use `__supabase` in DevTools to call `auth.getSession()`, `from()`, etc.
if (typeof globalThis !== 'undefined' && process.env.NODE_ENV !== 'production') {
  try {
    (globalThis as any).__supabase = supabase;
    // do not log debug info in console
  } catch (e) {
    // ignore failures attaching for environments without writable globalThis
  }
}

// Expose a small helper to subscribe to Supabase auth state changes.
// Consumers can call `onAuthStateChange(handler)` to receive `{ event, session }` updates
// and unsubscribe by calling the returned function.
export function onAuthStateChange(callback: (payload: { event: string; session: any }) => void) {
  if (!isSupabaseConfigured()) return () => { };
  try {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      try { callback({ event, session }); } catch (e) { console.error('onAuthStateChange callback error', e); }
    });
    return () => { try { data.subscription.unsubscribe(); } catch { } };
  } catch (e) {
    console.warn('Failed to subscribe to auth state changes', e);
    return () => { };
  }
}

// Check if Supabase is configured
export function isSupabaseConfigured() {
  // Ensure we have both a supabase URL and anon key and a initialized client
  const hasUrl = Boolean(rawSupabaseUrl || supabaseUrl);
  const hasKey = Boolean(publicAnonKey);
  const ok = hasUrl && hasKey && Boolean(_supabase);
  if (!ok && process.env.NODE_ENV !== 'production') {
    // helpful debug message during development
    // eslint-disable-next-line no-console
    console.warn('[Supabase] not fully configured. VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY may be missing.');
  }
  return ok;
}

// Cached health check to avoid repeated HEAD requests when offline or table missing
let _lastHealthCheckTs = 0;
let _lastHealthCheckResult: boolean | null = null;

// --------------------
// NEW: Helper to get current user UUID (RLS-safe)
// --------------------
// NOTE: Removed `getSupabaseUserId` helper — prefer using `supabase.auth.getSession()` or
// `supabase.auth.getUser()` directly where needed. Keeping client surface minimal.

// --------------------
// Helpers to check connection / health
// --------------------
export async function checkSupabaseConnection(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  // Cache result for 30 seconds to avoid repeating failing HEAD requests
  const now = Date.now();
  if (_lastHealthCheckResult !== null && now - _lastHealthCheckTs < 30000) {
    return _lastHealthCheckResult;
  }

  try {
    // Use a table that exists in the schema to perform a lightweight HEAD
    const { error } = await supabase.from('analytics_events').select('id', { head: true });
    const ok = !error;
    _lastHealthCheckTs = Date.now();
    _lastHealthCheckResult = ok;
    return ok;
  } catch (err) {
    // Do not spam console; record negative result and return false
    _lastHealthCheckTs = Date.now();
    _lastHealthCheckResult = false;
    return false;
  }
}

export async function getConnectionHealth(): Promise<{
  connected: boolean;
  latency: number;
  status: 'healthy' | 'slow' | 'disconnected';
}> {
  if (!isSupabaseConfigured()) return { connected: false, latency: 0, status: 'disconnected' };

  const start = Date.now();
  try {
    const { error } = await supabase.from('analytics_events').select('id', { head: true });
    const latency = Date.now() - start;
    if (error) return { connected: false, latency: 0, status: 'disconnected' };
    const status = latency < 200 ? 'healthy' : latency < 1000 ? 'slow' : 'disconnected';
    return { connected: true, latency, status };
  } catch (err) {
    return { connected: false, latency: 0, status: 'disconnected' };
  }
}

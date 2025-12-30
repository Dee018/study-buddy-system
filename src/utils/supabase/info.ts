// Expose Supabase configuration values derived from environment variables
// Prefer Vite-style `import.meta.env` when available, fallback to `process.env` for Node contexts
const env = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : (typeof process !== 'undefined' ? process.env : {});

const rawUrl = env.VITE_SUPABASE_URL || env.VITE_SUPABASE_PROJECT_URL || env.SUPABASE_URL || '';
const anonKey = env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANONKEY || env.SUPABASE_ANON_KEY || '';

function parseProjectId(url: string): string {
  try {
    if (!url) return '';
    const u = new URL(url);
    const host = u.hostname; // e.g. projectid.supabase.co
    const parts = host.split('.');
    if (parts.length === 0) return '';
    return parts[0];
  } catch (err) {
    // Try a simple regex fallback
    const m = /https?:\/\/([^\.]+)\.supabase\.co/.exec(url);
    return m ? m[1] : '';
  }
}

export const projectId: string = env.VITE_SUPABASE_PROJECT_ID || parseProjectId(rawUrl) || '';
export const publicAnonKey: string = anonKey || '';

export const rawSupabaseUrl = rawUrl;

export default {
  projectId,
  publicAnonKey,
  rawSupabaseUrl
};

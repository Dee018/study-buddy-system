// Generic retry / timeout wrapper for Supabase calls
// Provides exponential backoff, jitter, global timeout and error normalization
export interface RetryOptions {
  retries?: number; // total attempts (including first)
  // Backwards-compatible alias used across the codebase
  attempts?: number;
  initialDelayMs?: number; // starting backoff delay
  maxDelayMs?: number; // maximum backoff delay
  factor?: number; // exponential factor
  timeoutMs?: number; // global timeout for each attempt
  onRetry?: (err: unknown, attempt: number) => void; // optional hook
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function withTimeout<T>(promise: Promise<T>, ms?: number): Promise<T> {
  if (!ms || ms <= 0) return promise;

  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
    promise.then((v) => {
      clearTimeout(timer);
      resolve(v);
    }, (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function normalizeError(err: any): Error {
  // If Supabase-style error object, try to extract meaningful info
  if (!err) return new Error('Unknown error');

  if (err instanceof Error) return err;

  const msg = err.message || err.msg || err.error_description || err.error || JSON.stringify(err);
  const e = new Error(String(msg));

  try {
    // attach original error metadata for callers who want details
    (e as any).original = err;
    if (err.code) (e as any).code = err.code;
    if (err.status) (e as any).status = err.status;
  } catch (_) { }

  return e;
}

/**
 * Execute an async function with retries and exponential backoff.
 * Throws the last error if all attempts fail.
 */
export async function withRetries<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> {
  const {
    retries = 3,
    initialDelayMs = 300,
    maxDelayMs = 5000,
    factor = 2,
    timeoutMs = 10000,
    onRetry
  } = opts as any;

  // Support legacy callers that pass `{ attempts: N }` instead of `retries`.
  const totalAttempts = (opts as any).attempts ?? retries;

  let attempt = 0;
  let lastError: unknown = null;

  while (attempt < totalAttempts) {
    attempt++;
    try {
      const res = await withTimeout(fn(), timeoutMs);
      return res;
    } catch (err) {
      lastError = err;
      // If this was the last attempt, break and throw
      if (attempt >= retries) break;

      // Call retry hook if provided
      try { onRetry && onRetry(err, attempt); } catch (_) { }

      // Exponential backoff with jitter
      const delay = Math.min(maxDelayMs, initialDelayMs * Math.pow(factor, attempt - 1));
      const jitter = Math.floor(Math.random() * Math.min(200, delay));
      await sleep(delay + jitter);
      continue;
    }
  }

  throw normalizeError(lastError);
}

/**
 * Wrapper specifically for Supabase-style calls where result has { data, error }
 * Example usage:
 * const data = await supabaseCall(() => supabase.from('table').select('*'))
 */
export async function supabaseCall<T = any>(
  // Accept a function that may return a Promise<{data,error}> or a Postgrest builder/thenable.
  call: () => any,
  opts?: RetryOptions
): Promise<T | null> {
  return withRetries(async () => {
    // Call may return a PostgrestBuilder (thenable) or a Promise already.
    let res = call();

    // If the result is thenable (has .then), await it to get the `{ data, error }` shape.
    if (res && typeof (res as any).then === 'function') {
      try {
        res = await (res as Promise<any>);
      } catch (e) {
        // If awaiting throws, normalize and rethrow so retry logic can handle it
        throw e;
      }
    }

    // Normalize result: expect { data?, error? }
    const maybeError = (res as any)?.error;
    if (maybeError) throw maybeError;
    return (res as any)?.data ?? null;
  }, opts);
}

export default withRetries;

/**
 * Helper to normalize `onConflict` option for Supabase `.upsert()` calls.
 * Accepts either a single column name or an array of column names and returns
 * the runtime string expected by PostgREST.
 */
export function normalizeOnConflict(onConflict?: string | string[]): string | undefined {
  if (!onConflict) return undefined;
  if (Array.isArray(onConflict)) return onConflict.join(',');
  return onConflict;
}

/**
 * useAsync Hook
 * 
 * Generic hook for handling async operations with loading/error states
 */

import { useState, useCallback } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface AsyncActions<T, Args extends any[]> {
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
}

export type UseAsyncReturn<T, Args extends any[]> = AsyncState<T> & AsyncActions<T, Args>;

/**
 * Hook for managing async operations with loading and error states
 * 
 * @param asyncFunction - The async function to execute
 * @param immediate - Whether to execute immediately on mount
 * 
 * @example
 * const { data, loading, error, execute } = useAsync(
 *   async (userId: string) => {
 *     return await fetchUserData(userId);
 *   }
 * );
 * 
 * // Later...
 * await execute('user-123');
 */
export function useAsync<T, Args extends any[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  immediate: boolean = false
): UseAsyncReturn<T, Args> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  /**
   * Execute the async function
   */
  const execute = useCallback(async (...args: Args): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);

      const result = await asyncFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('useAsync error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
    setError,
  };
}

/**
 * Hook variant that executes on mount with dependencies
 * 
 * @param asyncFunction - The async function to execute
 * @param dependencies - Dependencies that trigger re-execution
 * 
 * @example
 * const { data, loading, error, refetch } = useAsyncEffect(
 *   async () => await fetchUserProfile(userId),
 *   [userId]
 * );
 */
export function useAsyncEffect<T>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
): AsyncState<T> & { refetch: () => Promise<T | null> } {
  const { data, loading, error, execute } = useAsync(asyncFunction);

  // Execute on mount and when dependencies change
  const depsKey = JSON.stringify(dependencies || []);
  React.useEffect(() => {
    execute();
    // Depend on a stable stringified representation of caller deps
  }, [execute, depsKey]);

  return {
    data,
    loading,
    error,
    refetch: execute,
  };
}

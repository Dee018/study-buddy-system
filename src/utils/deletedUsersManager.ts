/**
 * Deleted Users Manager
 * 
 * Handles tracking and managing deleted user accounts
 * Supports both admin-deleted and self-deleted accounts
 */

export interface DeletedUserAccount {
  userId: string;
  username: string;
  deletedAt: string;
  deletedBy: 'admin' | 'self';
  accountType: 'regular' | 'admin';
  lastActivity?: string;
  totalXP?: number;
  level?: string;
  reason?: string;
  daysInactive?: number;
}

import { supabase } from './supabase/client';
import { supabaseCall } from './supabase/withRetries';
import { toast } from 'sonner';

export class DeletedUsersManager {
  private static readonly DELETED_USERS_KEY = 'study_buddy_deleted_users';
  private static readonly DORMANT_THRESHOLD_DAYS = 90; // 3 months

  /**
   * Add a deleted user to the tracking system
   * SUPABASE TODO: Insert into deleted_users table
   */
  static addDeletedUser(account: DeletedUserAccount): void {
    try {
      if (typeof window === 'undefined') return;

      // DISABLED FOR SUPABASE MIGRATION
      // const deletedUsers = this.getAllDeletedUsers();
      // deletedUsers.push({
      //   ...account,
      //   deletedAt: new Date().toISOString()
      // });

      // localStorage.setItem(this.DELETED_USERS_KEY, JSON.stringify(deletedUsers));

      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('userDeleted', {
        detail: { account }
      }));
    } catch (error) {
      console.error('Error adding deleted user:', error);
    }
  }

  /**
   * Get all deleted users
   * SUPABASE TODO: Query from deleted_users table
   */
  static getAllDeletedUsers(): DeletedUserAccount[] {
    try {
      if (typeof window === 'undefined') return [];

      // DISABLED FOR SUPABASE MIGRATION
      // const data = localStorage.getItem(this.DELETED_USERS_KEY);
      // return data ? JSON.parse(data) : [];
      return [];
    } catch (error) {
      console.error('Error loading deleted users:', error);
      return [];
    }
  }

  /**
   * Get recently deleted users (last 30 days)
   */
  static getRecentlyDeleted(days: number = 30): DeletedUserAccount[] {
    const allDeleted = this.getAllDeletedUsers();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return allDeleted.filter(user => {
      const deletedDate = new Date(user.deletedAt);
      return deletedDate >= cutoffDate;
    });
  }

  /**
   * Get deleted users by deletion type
   */
  static getDeletedByType(type: 'admin' | 'self'): DeletedUserAccount[] {
    const allDeleted = this.getAllDeletedUsers();
    return allDeleted.filter(user => user.deletedBy === type);
  }

  /**
   * Check if a user is deleted
   */
  static isUserDeleted(userId: string): boolean {
    const deletedUsers = this.getAllDeletedUsers();
    return deletedUsers.some(user => user.userId === userId);
  }

  /**
   * Calculate days since last activity
   */
  static calculateInactiveDays(lastActivityDate: string): number {
    const lastActivity = new Date(lastActivityDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastActivity.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Check if a user is dormant (inactive for 90+ days)
   */
  static isDormantUser(lastActivityDate: string): boolean {
    const inactiveDays = this.calculateInactiveDays(lastActivityDate);
    return inactiveDays >= this.DORMANT_THRESHOLD_DAYS;
  }

  /**
   * Get statistics about deleted users
   */
  static getStatistics() {
    const allDeleted = this.getAllDeletedUsers();
    const selfDeleted = allDeleted.filter(u => u.deletedBy === 'self');
    const adminDeleted = allDeleted.filter(u => u.deletedBy === 'admin');
    const recentlyDeleted = this.getRecentlyDeleted(30);

    return {
      total: allDeleted.length,
      selfDeleted: selfDeleted.length,
      adminDeleted: adminDeleted.length,
      recentlyDeleted: recentlyDeleted.length,
      last30Days: recentlyDeleted.length,
      last7Days: this.getRecentlyDeleted(7).length
    };
  }

  /**
   * Clear deleted users older than specified days
   * SUPABASE TODO: Delete from deleted_users table
   */
  static clearOldDeletedUsers(_daysToKeep: number = 365): void {
    try {
      if (typeof window === 'undefined') return;

      // DISABLED FOR SUPABASE MIGRATION
      // const allDeleted = this.getAllDeletedUsers();
      // const cutoffDate = new Date();
      // cutoffDate.setDate(cutoffDate.getDate() - _daysToKeep);

      // const recentDeleted = allDeleted.filter(user => {
      //   const deletedDate = new Date(user.deletedAt);
      //   return deletedDate >= cutoffDate;
      // });

      // localStorage.setItem(this.DELETED_USERS_KEY, JSON.stringify(recentDeleted));
    } catch (error) {
      console.error('Error clearing old deleted users:', error);
    }
  }

  /**
   * Permanently remove a user from deleted users list
   * SUPABASE TODO: Delete from deleted_users table
   */
  static permanentlyRemove(userId: string): void {
    try {
      if (typeof window === 'undefined') return;

      // DISABLED FOR SUPABASE MIGRATION
      // const allDeleted = this.getAllDeletedUsers();
      // const filtered = allDeleted.filter(user => user.userId !== userId);

      // localStorage.setItem(this.DELETED_USERS_KEY, JSON.stringify(filtered));

      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('userPermanentlyRemoved', {
        detail: { userId }
      }));
    } catch (error) {
      console.error('Error permanently removing user:', error);
    }
  }

  /**
   * Export deleted users data (for admin backup)
   */
  static exportDeletedUsers(): string {
    const allDeleted = this.getAllDeletedUsers();
    return JSON.stringify(allDeleted, null, 2);
  }

  /**
   * Get dormant threshold in days
   */
  static getDormantThreshold(): number {
    return this.DORMANT_THRESHOLD_DAYS;
  }
}

// Async wrappers for migration to Supabase-backed storage
export namespace DeletedUsersManagerAsync {
  export async function getAllDeletedUsersAsync(): Promise<DeletedUserAccount[]> {
    try {
      // Try Supabase first
      try {
        // Read from the view for admin-friendly representation
        const res = await supabaseCall(() => supabase.from('deleted_users_view').select('*'), { retries: 2, timeoutMs: 6000 }) as any[] | null;
        if (res && Array.isArray(res)) {
          // Normalize snake_case -> camelCase and ensure `userId` is present
          const mapped = res.map((r: any) => {
            const deletedBy = r.deleted_by ?? r.deletedBy ?? null;
            return {
              userId: r.user_id ?? r.userId ?? r.id ?? '',
              username: r.username ?? r.user_name ?? r.user ?? '',
              deletedAt: r.deleted_at ?? r.deletedAt ?? r.deleted_at_iso ?? '',
              deletedBy: deletedBy ? 'admin' : 'self',
              accountType: r.account_type ?? r.accountType ?? 'regular',
              lastActivity: r.last_activity ?? r.lastActivity ?? undefined,
              totalXP: r.total_xp ?? r.totalXP ?? undefined,
              level: r.level ?? undefined,
              reason: r.reason ?? r.deletion_reason ?? undefined,
              daysInactive: r.days_inactive ?? r.daysInactive ?? undefined,
            } as DeletedUserAccount;
          });
          return mapped;
        }
      } catch (err) {
        // fallthrough to local fallback
      }
      return Promise.resolve(DeletedUsersManager.getAllDeletedUsers());
    } catch (err) {
      return [];
    }
  }

  export async function getStatisticsAsync() {
    try {
      // Try to compute from Supabase if available
      try {
        // The Supabase view exposes camelCase columns (deletedBy, deletedAt). Query accordingly.
        const rows = await supabaseCall(() => supabase.from('deleted_users_view').select('deletedBy'), { retries: 2, timeoutMs: 6000 }) as any[] | null;
        if (rows && Array.isArray(rows)) {
          const total = rows.length;
          // If deletedBy is non-null, assume admin deleted; otherwise treat as self-deleted
          const adminDeleted = rows.filter(r => r.deletedBy).length;
          const selfDeleted = total - adminDeleted;
          return { total, selfDeleted, adminDeleted, recentlyDeleted: 0, last30Days: 0, last7Days: 0 };
        }
      } catch (err) {
        // fallback
      }
      return Promise.resolve(DeletedUsersManager.getStatistics());
    } catch (err) {
      return Promise.resolve({ total: 0, selfDeleted: 0, adminDeleted: 0, recentlyDeleted: 0, last30Days: 0, last7Days: 0 });
    }
  }

  export async function addDeletedUserAsync(account: DeletedUserAccount): Promise<void> {
    try {
      // Try to persist to Supabase once. If a 403 / RLS error occurs, do not retry
      // to avoid spamming the console — surface a clear admin toast instead.
      const payload = [{
        user_id: account.userId,
        username: account.username,
        deletion_reason: account.reason || null,
        total_xp: account.totalXP || null,
        level: account.level || null,
        deleted_at: account.deletedAt || new Date().toISOString()
      }];

      // Check that the current authenticated user is an admin according to user_profiles
      try {
        const session = await supabase.auth.getSession();
        const currentId = session?.data?.session?.user?.id;
        if (!currentId) {
          try { toast.error('No active session; deletion applied locally.'); } catch { }
        } else {
          try {
            const profile = await supabase.from('user_profiles').select('is_admin').eq('id', currentId).maybeSingle();
            const isAdmin = (profile && (profile as any).data && (profile as any).data.is_admin) || (profile && (profile as any).is_admin) || false;
            if (!isAdmin) {
              try { toast.error('You are not authorized to persist deleted users to the server. Deletion applied locally.'); } catch { }
            } else {
              // Authenticated admin -> attempt insert
              try {
                const { error, status, data } = await supabase.from('deleted_users').insert(payload).select();
                if (error) {
                  const msg = error?.message || String(error);
                  if (status === 403 || /row-level security|permission|forbidden/i.test(msg)) {
                    // Failed to persist deleted user to Supabase (RLS/permission) (silent)
                    try { toast.error('Server prevented saving deleted user (permission/RLS). Deletion is applied locally.'); } catch { }
                  } else {
                    // Failed to persist deleted user to Supabase (silent)
                    try { toast.error('Failed to persist deleted user to server. Deletion applied locally.'); } catch { }
                  }
                } else {
                  // Persisted deleted user to Supabase (silent)
                }
              } catch (e) {
                // Unexpected error while inserting deleted_users (non-fatal) (silent)
                try { toast.error('Unexpected error saving deleted user. Deletion applied locally.'); } catch { }
              }
            }
          } catch (err) {
            // Failed to verify admin status before persisting deleted user (silent)
            try { toast.error('Failed to verify admin status. Deletion applied locally.'); } catch { }
          }
        }
      } catch (err) {
        // Failed to obtain session before persisting deleted user (silent)
        try { toast.error('Failed to obtain session. Deletion applied locally.'); } catch { }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('userDeleted', { detail: { account } }));
      }
    } catch (err) {
      // Failed to persist deleted user to Supabase (outer) (silent)
      try { toast.error('Failed to persist deleted user to server. Deletion applied locally.'); } catch { }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('userDeleted', { detail: { account } }));
      }
    }
  }

  export async function permanentlyRemoveAsync(userId: string): Promise<void> {
    try {
      // DeletedUsersManagerAsync.permanentlyRemoveAsync called (silent)
      // Validate input early to avoid sending invalid queries (eg. eq(undefined))
      if (!userId) {
        // permanentlyRemoveAsync called with empty userId (silent)
        try { toast?.warn?.('No user id provided; removal applied locally.'); } catch { }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('userPermanentlyRemoved', { detail: { userId } }));
        }
        return;
      }

      // Basic UUID-ish check to avoid sending clearly invalid values to Supabase
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        // permanentlyRemoveAsync called with non-UUID userId, skipping server delete (silent)
        try { toast?.warn?.('User id invalid; removal applied locally.'); } catch { }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('userPermanentlyRemoved', { detail: { userId } }));
        }
        return;
      }

      // requesting server-side permanent delete for user_id (silent)

      // Call the secure Edge Function to perform the deletion with service role
      const adminSecret = (import.meta as any).env?.VITE_ADMIN_SECRET;
      if (!adminSecret) {
        const msg = 'Missing admin secret (VITE_ADMIN_SECRET) in client build. Cannot call admin function.';
        // permanentlyRemoveAsync: missing admin secret (silent)
        try { toast?.error?.('Failed to permanently remove user', { description: msg }); } catch { }
        throw new Error(msg);
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-admin-secret': String(adminSecret) };
      const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANONKEY || '';
      if (anonKey) headers['Authorization'] = `Bearer ${String(anonKey)}`;

      const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
      const functionUrl = (import.meta.env.DEV && typeof window !== 'undefined')
        ? '/functions/v1/admin-permanently-delete'
        : `${supabaseUrl.replace(/\/$/, '')}/functions/v1/admin-permanently-delete`;

      // calling admin function at functionUrl (silent)

      const resp = await fetch(functionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId })
      });

      let json: any = null;
      try { json = await resp.json(); } catch (_) { }

      if (!resp.ok) {
        const serverMsg = json?.error || (json && JSON.stringify(json)) || (await resp.text().catch(() => 'server error'));
        console.error('permanentlyRemoveAsync: function returned non-OK', resp.status, serverMsg);
        try { toast?.error?.('Failed to permanently remove user', { description: String(serverMsg) }); } catch { }
        throw new Error(String(serverMsg));
      }

      if (!json || !json.ok) {
        const serverMsg = (json && (json.error || JSON.stringify(json))) || 'Unknown server error';
        console.error('permanentlyRemoveAsync: function responded with error', serverMsg);
        try { toast?.error?.('Failed to permanently remove user', { description: String(serverMsg) }); } catch { }
        throw new Error(String(serverMsg));
      }

      const deletedCount = Number(json.deletedCount || 0);
      // function deletedCount (silent)
      if (deletedCount <= 0) {
        const msg = 'No rows were deleted (deletedCount=0). This may indicate an audit row was not found.';
        console.error('permanentlyRemoveAsync:', msg);
        try { toast?.error?.('Failed to permanently remove user', { description: msg }); } catch { }
        throw new Error(msg);
      }

      try { toast?.success?.('User permanently removed'); } catch { }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('userPermanentlyRemoved', { detail: { userId } }));
      }
    } catch (err) {
      // Failed to permanently remove deleted user from Supabase, dispatching event locally (silent)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('userPermanentlyRemoved', { detail: { userId } }));
      }
    }
  }
}
/**
 * Account Information Manager
 * Tracks and manages user account information in real-time
 * - Account creation date
 * - Last login timestamp
 * - Total session count
 * - Account status
 */

import { supabase } from './supabase/client';
import { supabaseCall } from './supabase/withRetries';

export interface AccountInfo {
  userCode: string;
  username: string;
  accountCreated: string; // ISO timestamp
  lastLogin: string; // ISO timestamp
  totalSessions: number;
  accountStatus: 'Active' | 'Inactive' | 'Suspended';
  firstLoginDate: string; // ISO timestamp
  totalLoginDays: number; // Number of unique days user has logged in
}

class AccountInfoManager {
  private storageKey = (userCode: string) => `account_info_${userCode}`;

  /**
   * Initialize account info for a new user
   */
  initializeAccount(userCode: string, username: string): AccountInfo {
    const existingInfo = this.getAccountInfo(userCode);

    if (existingInfo) {
      // Update existing account with current login
      return this.recordLogin(userCode, username);
    }

    // Create new account info
    const now = new Date().toISOString();
    const accountInfo: AccountInfo = {
      userCode,
      username,
      accountCreated: now,
      lastLogin: now,
      totalSessions: 1,
      accountStatus: 'Active',
      firstLoginDate: now,
      totalLoginDays: 1
    };

    this.saveAccountInfo(accountInfo);
    return accountInfo;
  }

  /**
   * Record a new login session
   */
  recordLogin(userCode: string, username: string): AccountInfo {
    const existingInfo = this.getAccountInfo(userCode);
    const now = new Date().toISOString();

    if (!existingInfo) {
      return this.initializeAccount(userCode, username);
    }

    // Check if this is a new day
    const lastLoginDate = new Date(existingInfo.lastLogin);
    const currentDate = new Date();
    const isNewDay = !this.isSameDay(lastLoginDate, currentDate);

    const updatedInfo: AccountInfo = {
      ...existingInfo,
      username, // Update username in case it changed
      lastLogin: now,
      totalSessions: existingInfo.totalSessions + 1,
      totalLoginDays: isNewDay
        ? existingInfo.totalLoginDays + 1
        : existingInfo.totalLoginDays,
      accountStatus: 'Active'
    };

    this.saveAccountInfo(updatedInfo);
    return updatedInfo;
  }

  /**
   * Get account information
   * SUPABASE TODO: Query from user_accounts table
   */
  getAccountInfo(_userCode: string): AccountInfo | null {
    try {
      if (typeof window === 'undefined') return null;

      // DISABLED FOR SUPABASE MIGRATION - Returns null
      // const stored = localStorage.getItem(this.storageKey(userCode));
      // if (!stored) return null;

      // const accountInfo = JSON.parse(stored) as AccountInfo;

      // // Validate required fields
      // if (!accountInfo.userCode || !accountInfo.accountCreated) {
      //   return null;
      // }

      // return accountInfo;
      return null;
    } catch (error) {
      console.error('Error getting account info:', error);
      return null;
    }
  }

  /**
   * Save account information
   * SUPABASE TODO: Insert/update in user_accounts table
   */
  private saveAccountInfo(accountInfo: AccountInfo): void {
    try {
      if (typeof window === 'undefined') return;

      // Trigger async Supabase save in background. Keep method synchronous for callers.
      this.saveAccountInfoAsync(accountInfo).catch((err) => {
        console.error('Background saveAccountInfoAsync failed:', err);
      });
    } catch (error) {
      console.error('Error saving account info:', error);
    }
  }

  // Persist to Supabase (upsert). Returns true on success.
  private async saveAccountInfoAsync(accountInfo: AccountInfo): Promise<boolean> {
    try {
      // Try to find an existing mapping row. Prefer matching by user_code, then by username.
      let existing: any = null;
      try {
        existing = await supabaseCall(() => supabase.from('user_accounts').select('*').eq('user_code', accountInfo.userCode).limit(1).maybeSingle());
      } catch (e) {
        // ignore - will try username below
      }

      if (!existing) {
        try {
          existing = await supabaseCall(() => supabase.from('user_accounts').select('*').eq('username', accountInfo.username).limit(1).maybeSingle());
        } catch (e) {
          // ignore
        }
      }

      const payload: any = {
        user_code: accountInfo.userCode,
        username: accountInfo.username,
        account_created: accountInfo.accountCreated,
        last_login: accountInfo.lastLogin,
        total_sessions: accountInfo.totalSessions,
        account_status: accountInfo.accountStatus,
        first_login_date: accountInfo.firstLoginDate,
        total_login_days: accountInfo.totalLoginDays
      };

      // If we discovered a canonical user_id in the mapping, include it so upsert can
      // match on user_id instead of user_code. This keeps the auth.user -> user_accounts
      // mapping consistent when AuthService.signUp has already inserted by user_id.
      const conflictKey = existing && (existing as any).user_id ? 'user_id' : 'user_code';
      if (existing && (existing as any).user_id) payload.user_id = (existing as any).user_id;

      await supabaseCall(() => supabase.from('user_accounts').upsert(payload, { onConflict: conflictKey }));
      return true;
    } catch (err) {
      console.error('saveAccountInfoAsync error:', err);
      return false;
    }
  }

  /**
   * Update username
   */
  updateUsername(userCode: string, newUsername: string): boolean {
    const accountInfo = this.getAccountInfo(userCode);
    if (!accountInfo) return false;

    accountInfo.username = newUsername;
    this.saveAccountInfo(accountInfo);
    return true;
  }

  /**
   * Update account status
   */
  updateAccountStatus(
    userCode: string,
    status: 'Active' | 'Inactive' | 'Suspended'
  ): boolean {
    const accountInfo = this.getAccountInfo(userCode);
    if (!accountInfo) return false;

    accountInfo.accountStatus = status;
    this.saveAccountInfo(accountInfo);
    return true;
  }

  /**
   * Get formatted account age
   */
  getAccountAge(userCode: string): string {
    const accountInfo = this.getAccountInfo(userCode);
    if (!accountInfo) return 'Unknown';

    const created = new Date(accountInfo.accountCreated);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
  }

  /**
   * Get formatted last login time
   */
  getLastLoginTime(userCode: string): string {
    const accountInfo = this.getAccountInfo(userCode);
    if (!accountInfo) return 'Unknown';

    const lastLogin = new Date(accountInfo.lastLogin);
    const now = new Date();
    const diffMs = now.getTime() - lastLogin.getTime();

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    // Return formatted date for older logins
    return lastLogin.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: lastLogin.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  /**
   * Get total sessions count
   */
  getTotalSessions(userCode: string): number {
    const accountInfo = this.getAccountInfo(userCode);
    return accountInfo ? accountInfo.totalSessions : 0;
  }

  /**
   * Get account status with color
   */
  getAccountStatus(userCode: string): {
    status: string;
    variant: 'default' | 'outline' | 'secondary' | 'destructive';
    colorClass: string;
  } {
    const accountInfo = this.getAccountInfo(userCode);

    if (!accountInfo) {
      return {
        status: 'Unknown',
        variant: 'secondary',
        colorClass: 'border-gray-500/50 text-gray-500'
      };
    }

    // Check if account is active (logged in within last 7 days)
    const lastLogin = new Date(accountInfo.lastLogin);
    const daysSinceLogin = Math.floor(
      (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (accountInfo.accountStatus === 'Suspended') {
      return {
        status: 'Suspended',
        variant: 'destructive',
        colorClass: 'border-red-500/50 text-red-500'
      };
    }

    if (daysSinceLogin > 30) {
      return {
        status: 'Inactive',
        variant: 'outline',
        colorClass: 'border-yellow-500/50 text-yellow-500'
      };
    }

    return {
      status: 'Active',
      variant: 'outline',
      colorClass: 'border-green-500/50 text-green-500'
    };
  }

  /**
   * Check if two dates are on the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Delete account info (for account deletion)
   * SUPABASE TODO: Delete from user_accounts table
   */
  deleteAccountInfo(userCode: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      // Trigger async delete in background
      this.deleteAccountInfoAsync(userCode).catch((err) => {
        console.error('Background deleteAccountInfoAsync failed:', err);
      });
      return true;
    } catch (error) {
      console.error('Error deleting account info:', error);
      return false;
    }
  }

  /* Async helpers for migration to Supabase */
  async getAccountInfoAsync(userCode: string): Promise<AccountInfo | null> {
    try {
      const row = await supabaseCall(() => supabase.from('user_accounts').select('*').eq('user_code', userCode).limit(1).maybeSingle());
      if (!row) return null;

      const acct: AccountInfo = {
        userCode: (row as any).user_code,
        username: (row as any).username,
        accountCreated: (row as any).account_created,
        lastLogin: (row as any).last_login,
        totalSessions: Number((row as any).total_sessions || 0),
        accountStatus: ((row as any).account_status as AccountInfo['accountStatus']) || 'Active',
        firstLoginDate: (row as any).first_login_date,
        totalLoginDays: Number((row as any).total_login_days || 0)
      };

      return acct;
    } catch (err) {
      console.error('getAccountInfoAsync error:', err);
      return null;
    }
  }

  async getAccountStatsAsync(userCode: string) {
    try {
      const acct = await this.getAccountInfoAsync(userCode);
      if (!acct) return null;
      return {
        accountAge: this.getAccountAge(userCode),
        lastLogin: this.getLastLoginTime(userCode),
        totalSessions: acct.totalSessions,
        status: this.getAccountStatus(userCode),
        totalLoginDays: acct.totalLoginDays,
        accountCreatedDate: new Date(acct.accountCreated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      };
    } catch (err) {
      return null;
    }
  }

  async getTotalSessionsAsync(userCode: string): Promise<number> {
    try {
      const acct = await this.getAccountInfoAsync(userCode);
      return acct ? acct.totalSessions : 0;
    } catch (err) {
      return 0;
    }
  }

  async getAccountStatusAsync(userCode: string) {
    try {
      const acct = await this.getAccountInfoAsync(userCode);
      if (!acct) return { status: 'Unknown', variant: 'secondary' as const, colorClass: 'border-gray-500/50 text-gray-500' };
      return this.getAccountStatus(userCode);
    } catch (err) {
      return { status: 'Unknown', variant: 'secondary' as const, colorClass: 'border-gray-500/50 text-gray-500' };
    }
  }

  // Async delete
  private async deleteAccountInfoAsync(userCode: string): Promise<boolean> {
    try {
      await supabaseCall(() => supabase.from('user_accounts').delete().eq('user_code', userCode));
      return true;
    } catch (err) {
      console.error('deleteAccountInfoAsync error:', err);
      return false;
    }
  }

  // Async mutation helpers
  async initializeAccountAsync(userCode: string, username: string): Promise<AccountInfo> {
    const existing = await this.getAccountInfoAsync(userCode);
    if (existing) return this.recordLoginAsync(userCode, username);

    const now = new Date().toISOString();
    const accountInfo: AccountInfo = {
      userCode,
      username,
      accountCreated: now,
      lastLogin: now,
      totalSessions: 1,
      accountStatus: 'Active',
      firstLoginDate: now,
      totalLoginDays: 1
    };

    await this.saveAccountInfoAsync(accountInfo).catch((err) => console.error('initializeAccountAsync save failed:', err));
    return accountInfo;
  }

  async recordLoginAsync(userCode: string, username: string): Promise<AccountInfo> {
    const existing = await this.getAccountInfoAsync(userCode);
    const now = new Date().toISOString();

    if (!existing) return this.initializeAccountAsync(userCode, username);

    const lastLoginDate = new Date(existing.lastLogin);
    const currentDate = new Date();
    const isNewDay = !this.isSameDay(lastLoginDate, currentDate);

    const updatedInfo: AccountInfo = {
      ...existing,
      username,
      lastLogin: now,
      totalSessions: existing.totalSessions + 1,
      totalLoginDays: isNewDay ? existing.totalLoginDays + 1 : existing.totalLoginDays,
      accountStatus: 'Active'
    };

    await this.saveAccountInfoAsync(updatedInfo).catch((err) => console.error('recordLoginAsync save failed:', err));
    return updatedInfo;
  }

  async updateUsernameAsync(userCode: string, newUsername: string): Promise<boolean> {
    const acct = await this.getAccountInfoAsync(userCode);
    if (!acct) return false;
    acct.username = newUsername;
    return this.saveAccountInfoAsync(acct);
  }

  async updateAccountStatusAsync(userCode: string, status: 'Active' | 'Inactive' | 'Suspended'): Promise<boolean> {
    const acct = await this.getAccountInfoAsync(userCode);
    if (!acct) return false;
    acct.accountStatus = status;
    return this.saveAccountInfoAsync(acct);
  }

  /**
   * Get all account stats for display
   */
  getAccountStats(userCode: string): {
    accountAge: string;
    lastLogin: string;
    totalSessions: number;
    status: ReturnType<typeof this.getAccountStatus>;
    totalLoginDays: number;
    accountCreatedDate: string;
  } | null {
    const accountInfo = this.getAccountInfo(userCode);
    if (!accountInfo) return null;

    const createdDate = new Date(accountInfo.accountCreated);

    return {
      accountAge: this.getAccountAge(userCode),
      lastLogin: this.getLastLoginTime(userCode),
      totalSessions: this.getTotalSessions(userCode),
      status: this.getAccountStatus(userCode),
      totalLoginDays: accountInfo.totalLoginDays,
      accountCreatedDate: createdDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    };
  }
}

export const accountInfoManager = new AccountInfoManager();
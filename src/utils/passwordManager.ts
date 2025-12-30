// Password Manager - Handles password validation, hashing, and authentication
import { isAdminUUID } from './adminConfig';
import { supabase } from './supabase/client';
import { supabaseCall } from './supabase/withRetries';

// Simple UUID v4 validator (canonical form)
function isUUID(v: string | null | undefined): boolean {
  if (!v || typeof v !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

export interface PasswordChangeHistory {
  timestamp: string;
  changeType: 'created' | 'reset' | 'changed';
  userId: string;
}

export class PasswordManager {
  private static readonly PASSWORD_KEY_PREFIX = 'user_password_';
  private static readonly PASSWORD_HISTORY_KEY = 'password_change_history_';
  private static readonly MIN_LENGTH = 8;

  /**
   * Validate password against requirements
   */
  static validatePassword(password: string): PasswordValidation {
    const errors: string[] = [];

    if (!password || password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
    }
    if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
    if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('Password must contain at least one special character');

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Hash password using SHA-256
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Error hashing password:', error);
      return this.simpleHash(password);
    }
  }

  /**
   * Fallback simple hash function
   */
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  /**
   * Store a password for a user
   * Safely skips Supabase write if no active session exists
   */
  static async storePassword(userId: string, password: string, _changeType: 'created' | 'reset' | 'changed' = 'created'): Promise<void> {
    try {
      const passwordHash = await this.hashPassword(password);

      const sessionData = await supabase.auth.getSession();
      const canonicalId = sessionData?.data?.session?.user?.id;

      if (!canonicalId || !isUUID(canonicalId)) {
        // PasswordManager: no active Supabase session; skipping Supabase write. (silent)
        return;
      }

      await supabaseCall(() =>
        supabase
          .from('user_passwords')
          .upsert(
            [
              {
                user_id: canonicalId,
                password_hash: passwordHash,
                changed_at: new Date().toISOString()
              }
            ],
            { onConflict: ['user_id'] }
          )
          .select()
          .maybeSingle(),
        { retries: 3, initialDelayMs: 300, timeoutMs: 8000 }
      );
    } catch (error) {
      console.error('Error storing password:', error);
    }
  }

  /**
   * Verify password for a user
   * Safely skips verification if no active session exists
   */
  static async verifyPassword(userId: string, password: string): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false;

      const sessionData = await supabase.auth.getSession();
      const canonicalId = sessionData?.data?.session?.user?.id;

      if (!canonicalId || !isUUID(canonicalId)) {
        // PasswordManager: no active Supabase session; cannot verify password. (silent)
        return false;
      }

      const row = await supabaseCall(() =>
        supabase.from('user_passwords').select('password_hash').eq('user_id', canonicalId).maybeSingle(),
        { retries: 2, timeoutMs: 5000 }
      ) as any | null;

      if (row && row.password_hash) {
        const inputHash = await this.hashPassword(password);
        return inputHash === row.password_hash;
      }

      return false;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  /**
   * Reset password using UUID (recovery)
   */
  static async resetPasswordWithUUID(uuid: string, newPassword: string, expectedUsername?: string): Promise<{ success: boolean; username?: string; error?: string }> {
    try {
      if (isAdminUUID(uuid)) return { success: false, error: 'Admin account cannot be modified.' };

      const actualUsername = await this.getUsernameFromUUIDAsync(uuid);
      if (!actualUsername) return { success: false, error: 'UUID not found' };
      if (expectedUsername && actualUsername.toLowerCase() !== expectedUsername.toLowerCase()) return { success: false, error: 'UUID does not match username' };

      const validation = this.validatePassword(newPassword);
      if (!validation.isValid) return { success: false, error: validation.errors.join(', ') };

      await this.storePassword(uuid, newPassword, 'reset');
      return { success: true, username: actualUsername };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, error: 'Failed to reset password' };
    }
  }

  /**
   * Change password for a user
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (isAdminUUID(userId)) return { success: false, error: 'Admin account password cannot be changed.' };

      const isValid = await this.verifyPassword(userId, currentPassword);
      if (!isValid) return { success: false, error: 'Current password is incorrect' };

      const validation = this.validatePassword(newPassword);
      if (!validation.isValid) return { success: false, error: validation.errors.join(', ') };

      await this.storePassword(userId, newPassword, 'changed');
      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, error: 'Failed to change password' };
    }
  }

  /**
   * Get password change history (skips Supabase if no session)
   */
  static getPasswordHistory(_userId: string): PasswordChangeHistory | null {
    try {
      // Supabase access requires active session
      if (typeof window === 'undefined') return null;

      return null; // Keep synchronous stub; async Supabase call skipped
    } catch (error) {
      console.error('Error getting password history:', error);
      return null;
    }
  }

  /**
   * Clear password for a user (used when deleting account)
   * Safely skips Supabase if no session
   */
  static async clearPassword(userId: string): Promise<void> {
    try {
      const sessionData = await supabase.auth.getSession();
      const canonicalId = sessionData?.data?.session?.user?.id;

      if (!canonicalId || !isUUID(canonicalId)) {
        // PasswordManager: no active Supabase session; skipping password clear. (silent)
        return;
      }

      await supabaseCall(() =>
        supabase.from('user_passwords').delete().eq('user_id', canonicalId),
        { retries: 2, timeoutMs: 4000 }
      );
    } catch (error) {
      console.error('Error clearing password:', error);
    }
  }

  /**
   * Async username lookup from UUID
   * Safely skips Supabase if no session
   */
  static async getUsernameFromUUIDAsync(uuid: string): Promise<string | null> {
    try {
      if (typeof window === 'undefined') return null;

      // Try to resolve the identifier against `user_profiles` table.
      // Accepts: id (UUID), username, or email. This lookup does NOT require
      // an active Supabase session because password recovery must work from
      // the unauthenticated landing page.


      // 1) Try recovery `uuid` column (common recovery code stored separately)
      const byRecoveryUuid = await supabaseCall(() =>
        supabase.from('user_profiles').select('username').eq('uuid', uuid).maybeSingle(),
        { retries: 2, timeoutMs: 5000 }
      ) as any | null;
      if (byRecoveryUuid && byRecoveryUuid.username) return byRecoveryUuid.username;

      // 2) Try exact id match
      const byId = await supabaseCall(() =>
        supabase.from('user_profiles').select('username').eq('id', uuid).maybeSingle(),
        { retries: 2, timeoutMs: 5000 }
      ) as any | null;
      if (byId && byId.username) return byId.username;

      // 2) Try username exact match
      const byUsername = await supabaseCall(() =>
        supabase.from('user_profiles').select('username').eq('username', uuid).maybeSingle(),
        { retries: 2, timeoutMs: 5000 }
      ) as any | null;
      if (byUsername && byUsername.username) return byUsername.username;

      // 3) Try email exact match
      const byEmail = await supabaseCall(() =>
        supabase.from('user_profiles').select('username').eq('email', uuid).maybeSingle(),
        { retries: 2, timeoutMs: 5000 }
      ) as any | null;
      if (byEmail && byEmail.username) return byEmail.username;

      return null;
    } catch (error) {
      console.error('Error getting username from UUID:', error);
      return null;
    }
  }

  /**
   * Password strength indicator
   */
  static getPasswordStrength(password: string): { strength: 'weak' | 'medium' | 'strong' | 'very-strong'; score: number } {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password) && password.length >= 12) score += 1;

    let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
    if (score <= 3) strength = 'weak';
    else if (score <= 5) strength = 'medium';
    else if (score <= 7) strength = 'strong';
    else strength = 'very-strong';

    return { strength, score };
  }

  /**
   * Check if the current authenticated user has a password set
   * Safe for landing page (no session = false)
   */
  static async hasPassword(userId?: string): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false;

      // If caller provided a `userId`, check that user's password record directly.
      if (userId) {
        const row = await supabaseCall(() =>
          supabase.from('user_passwords').select('user_id').eq('user_id', userId).maybeSingle(),
          { retries: 2, timeoutMs: 8000 }
        ) as any | null;
        return !!row;
      }

      const sessionData = await supabase.auth.getSession();
      const canonicalId = sessionData?.data?.session?.user?.id;

      if (!canonicalId || !isUUID(canonicalId)) {
        return false;
      }

      const result = await supabaseCall(
        () =>
          supabase
            .from('user_passwords')
            .select('user_id')
            .eq('user_id', canonicalId)
            .maybeSingle(),
        { retries: 2, timeoutMs: 8000 }
      ) as any | null;

      return !!result;
    } catch (error) {
      // PasswordManager.hasPassword failed safely (silent)
      return false;
    }
  }


}

export default PasswordManager;

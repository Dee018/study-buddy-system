/**
 * Auto-Save Manager
 * 
 * Manages automatic saving of user code (lessons, exercises, projects)
 * Uses localStorage for temporary persistence until code is submitted
 * Integrates with AutoSaveContext for Supabase-backed auto-save
 */

export class AutoSaveManager {
  private static readonly STORAGE_KEY_PREFIX = 'study_buddy_autosave_';
  private static readonly INTERVAL = 30000; // 30 seconds
  private static autoSaveTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Generate storage key for auto-saved code
   */
  private static getStorageKey(
    userId: string,
    moduleId: string,
    itemId: string,
    itemType: 'lesson' | 'exercise' | 'project'
  ): string {
    return `${this.STORAGE_KEY_PREFIX}${userId}_${moduleId}_${itemType}_${itemId}`;
  }

  /**
   * Save code to localStorage
   */
  static saveCode(
    userId: string,
    moduleId: string,
    itemId: string,
    itemType: 'lesson' | 'exercise' | 'project',
    code: string
  ): void {
    // Auto-save to localStorage has been disabled in favor of Supabase-backed autosave.
    // Keep a lightweight in-memory cache if callers rely on immediate reads.
    try {
      // No-op: supplant local persistence with ProgressSyncManager / AutoSaveContext
      console.debug('[AutoSaveManager] saveCode disabled (supabase-backed only)', { userId, moduleId, itemId, itemType });
    } catch (error) {
      console.warn('[AutoSaveManager] saveCode disabled error', error);
    }
  }

  /**
   * Load auto-saved code from localStorage
   */
  static loadCode(
    userId: string,
    moduleId: string,
    itemId: string,
    itemType: 'lesson' | 'exercise' | 'project'
  ): string | null {
    // Local autosave load disabled. Supabase is the authoritative source.
    try {
      console.debug('[AutoSaveManager] loadCode disabled (supabase-backed only)', { userId, moduleId, itemId, itemType });
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear auto-saved code
   */
  static clearCode(
    userId: string,
    moduleId: string,
    itemId: string,
    itemType: 'lesson' | 'exercise' | 'project'
  ): void {
    try {
      console.debug('[AutoSaveManager] clearCode disabled (no-op)', { userId, moduleId, itemId, itemType });
    } catch (error) {
      console.warn('[AutoSaveManager] clearCode error', error);
    }
  }

  /**
   * Start automatic saving with interval
   */
  static startAutoSave(
    userId: string,
    moduleId: string,
    itemId: string,
    itemType: 'lesson' | 'exercise' | 'project',
    getCode: () => string
  ): void {
    const saveKey = `${userId}_${moduleId}_${itemType}_${itemId}`;

    // Clear existing timer if any
    this.stopAutoSave(saveKey);

    // Set up new timer
    const timer = setInterval(() => {
      const code = getCode();
      if (code) {
        this.saveCode(userId, moduleId, itemId, itemType, code);
      }
    }, this.INTERVAL);

    this.autoSaveTimers.set(saveKey, timer);
  }

  /**
   * Stop automatic saving
   */
  static stopAutoSave(saveKey: string): void {
    const timer = this.autoSaveTimers.get(saveKey);
    if (timer) {
      clearInterval(timer);
      this.autoSaveTimers.delete(saveKey);
    }
  }

  /**
   * Stop all auto-save timers (cleanup on logout)
   */
  static stopAllAutoSave(): void {
    this.autoSaveTimers.forEach(timer => clearInterval(timer));
    this.autoSaveTimers.clear();
  }

  /**
   * Get all auto-saved items for a user
   */
  static getAllAutoSavedItems(userId: string): Array<{
    moduleId: string;
    itemId: string;
    itemType: 'lesson' | 'exercise' | 'project';
    code: string;
    timestamp: number;
  }> {
    // Local autosave storage disabled. Return empty list; use Supabase instead.
    console.debug('[AutoSaveManager] getAllAutoSavedItems disabled, returning empty array', { userId });
    return [];
  }

  /**
   * Clear all auto-saved items for a user
   */
  static clearAllAutoSavedItems(userId: string): void {
    try {
      console.debug('[AutoSaveManager] clearAllAutoSavedItems disabled (cleanup handled centrally) for', userId);
    } catch (error) {
      console.warn('[AutoSaveManager] clearAllAutoSavedItems error', error);
    }
  }

  /**
   * Clean up old auto-saved items (older than 24 hours)
   */
  static cleanupOldItems(): void {
    // Disabled: local storage autosave cleanup handled centrally at AppProviders startup.
    try {
      console.debug('[AutoSaveManager] cleanupOldItems disabled');
    } catch (e) { /* ignore */ }
  }
}

// Run cleanup on load
if (typeof window !== 'undefined') {
  AutoSaveManager.cleanupOldItems();
}

export default AutoSaveManager;

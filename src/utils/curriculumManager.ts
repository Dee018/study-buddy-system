// javaCurriculum not required in this module after migration
import { comprehensiveBeginnerTrack, comprehensiveLearnerTrack } from '../data/comprehensiveBeginnerCurriculum';
import { withRetries } from './supabase/withRetries';
import { module5, module6 } from '../data/javaLearnerCurriculumPart1';
import { module7, module8 } from '../data/javaLearnerCurriculumPart2';
// Advanced modules (9-12) are intentionally hidden for this release

interface Module {
  id: string;
  week: number;
  title: string;
  description: string;
  category: string;
  estimatedHours: number;
  lessons: any[];
  thumbnail?: string;
}

export class CurriculumManager {
  private static readonly CURRICULUM_KEY = 'study_buddy_curriculum_edits';

  // Get all curriculum modules (visible tracks only)
  static getAllModules(): Module[] {
    const edits = this.getEdits();
    // Combine all curriculum modules:
    // - Beginner (modules 1-3)
    // - Learner (modules 4-6)
    // - Advanced (modules 7-8)
    const allCurriculumModules = [
      ...comprehensiveBeginnerTrack, // Beginner modules (1-3)
      ...comprehensiveLearnerTrack,  // Learner modules (4-6)
      module7, module8               // Advanced modules (7-8)
    ];

    // Apply any saved edits
    return allCurriculumModules.map(module => {
      const edit = edits[module.id];
      return edit ? { ...module, ...edit } : module;
    });
  }

  // Get a single module by ID
  static getModule(moduleId: string): Module | undefined {
    const edits = this.getEdits();
    // Combine visible curriculum modules
    const allCurriculumModules = [
      ...comprehensiveBeginnerTrack,
      ...comprehensiveLearnerTrack,
      module7, module8
    ];
    const module = allCurriculumModules.find(m => m.id === moduleId);

    if (!module) return undefined;

    // Apply any saved edits
    const edit = edits[moduleId];
    return edit ? { ...module, ...edit } : module;
  }

  // Save module edits
  static saveModule(moduleId: string, updatedModule: Module): void {
    try {
      if (typeof window === 'undefined') return;

      const edits = this.getEdits();
      edits[moduleId] = {
        title: updatedModule.title,
        description: updatedModule.description,
        category: updatedModule.category,
        estimatedHours: updatedModule.estimatedHours,
        lessons: updatedModule.lessons,
        thumbnail: updatedModule.thumbnail
      };

      // DISABLED FOR SUPABASE MIGRATION
      // localStorage.setItem(this.CURRICULUM_KEY, JSON.stringify(edits));

      // Dispatch custom event to notify components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('curriculumUpdated', {
          detail: { moduleId, updatedModule }
        }));
      }
    } catch (error) {
      console.error('Error saving module edits:', error);
    }
  }

  // Async wrappers for migration
  static async getAllModulesAsync(): Promise<Module[]> {
    try {
      return Promise.resolve(this.getAllModules());
    } catch (err) {
      return Promise.resolve([]);
    }
  }

  static async getModuleAsync(moduleId: string): Promise<Module | undefined> {
    try {
      return Promise.resolve(this.getModule(moduleId));
    } catch (err) {
      return Promise.resolve(undefined);
    }
  }

  static async saveModuleAsync(moduleId: string, updatedModule: Module): Promise<void> {
    return withRetries(() => Promise.resolve(this.saveModule(moduleId, updatedModule)), { retries: 3, timeoutMs: 3000 });
  }

  static async clearAllEditsAsync(): Promise<void> {
    return withRetries(() => Promise.resolve(this.clearAllEdits()), { retries: 3, timeoutMs: 4000 });
  }

  static async clearModuleEditsAsync(moduleId: string): Promise<void> {
    return withRetries(() => Promise.resolve(this.clearModuleEdits(moduleId)), { retries: 3, timeoutMs: 3000 });
  }

  // Get all saved edits
  // SUPABASE TODO: Query from curriculum_edits table
  private static getEdits(): { [moduleId: string]: Partial<Module> } {
    try {
      if (typeof window === 'undefined') return {};

      // DISABLED FOR SUPABASE MIGRATION
      // const stored = localStorage.getItem(this.CURRICULUM_KEY);
      // return stored ? JSON.parse(stored) : {};
      return {};
    } catch (error) {
      console.error('Error loading curriculum edits:', error);
      return {};
    }
  }

  // Check if a module has been edited
  static hasEdits(moduleId: string): boolean {
    const edits = this.getEdits();
    return !!edits[moduleId];
  }

  // Clear all edits (for admin purposes)
  // SUPABASE TODO: Delete from curriculum_edits table
  static clearAllEdits(): void {
    try {
      if (typeof window === 'undefined') return;
      // DISABLED FOR SUPABASE MIGRATION
      // localStorage.removeItem(this.CURRICULUM_KEY);

      // Dispatch event to notify components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('curriculumUpdated', {
          detail: { cleared: true }
        }));
      }
    } catch (error) {
      console.error('Error clearing curriculum edits:', error);
    }
  }

  // Clear edits for a specific module
  // SUPABASE TODO: Delete from curriculum_edits table
  static clearModuleEdits(moduleId: string): void {
    try {
      if (typeof window === 'undefined') return;

      // DISABLED FOR SUPABASE MIGRATION
      // const edits = this.getEdits();
      // delete edits[moduleId];
      // localStorage.setItem(this.CURRICULUM_KEY, JSON.stringify(edits));

      // Dispatch event to notify components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('curriculumUpdated', {
          detail: { moduleId, cleared: true }
        }));
      }
    } catch (error) {
      console.error('Error clearing module edits:', error);
    }
  }
}
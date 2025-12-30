/**
 * Content Manager - Single Source of Truth for All Study Buddy Content
 * 
 * This service manages all curriculum content including:
 * - Modules (containers for learning units)
 * - Lessons (educational content/reading materials)
 * - Practices (hands-on practice exercises)
 * - Exercises (assessment questions/problems)
 * - Projects (larger assignments/capstone work)
 * 
 * All content is synchronized between Admin Dashboard and User Interface
 */

// javaCurriculum imported previously; not needed here after consolidation
import { comprehensiveBeginnerTrack, comprehensiveLearnerTrack, DetailedModule, DetailedLesson, Exercise, Project } from '../data/comprehensiveBeginnerCurriculum';
import { withRetries, supabaseCall } from './supabase/withRetries';
import { supabase, isSupabaseConfigured } from './supabase/client';
import { module5, module6 } from '../data/javaLearnerCurriculumPart1';
import { module7, module8 } from '../data/javaLearnerCurriculumPart2';

interface ContentEdits {
  modules: { [moduleId: string]: Partial<DetailedModule> };
  lessons: { [lessonId: string]: Partial<DetailedLesson> };
  exercises: { [exerciseId: string]: Partial<Exercise> };
  projects: { [projectId: string]: Partial<Project> };
  publishStatus: { [contentId: string]: boolean }; // Track published vs draft status
}

export class ContentManager {
  private static readonly CONTENT_KEY = 'study_buddy_content_v2';
  private static instance: ContentManager;

  static getInstance(): ContentManager {
    if (!ContentManager.instance) {
      ContentManager.instance = new ContentManager();
    }
    return ContentManager.instance;
  }

  // ========== MODULE MANAGEMENT ==========

  /**
   * Get all modules (combining all tracks) with applied edits
   */
  static getAllModules(): DetailedModule[] {
    const edits = this.getEdits();
    // Combine curriculum modules for visible tracks only:
    // - Beginner (modules 1-3)
    // - Learner (modules 4-6)
    // - Advanced (modules 7-8)
    const allCurriculumModules = [
      ...comprehensiveBeginnerTrack, // Beginner modules (1-3)
      ...comprehensiveLearnerTrack,  // Learner modules (4-6)
      module7, module8               // Advanced modules (7-8)
    ];

    return allCurriculumModules.map(module => {
      const moduleEdit = edits.modules[module.id];
      const baseModule = moduleEdit ? { ...module, ...moduleEdit } : module;

      // Apply lesson edits
      const lessons = baseModule.lessons?.map(lesson => {
        const lessonEdit = edits.lessons[lesson.id];
        return lessonEdit ? { ...lesson, ...lessonEdit } : lesson;
      }) || [];

      // Apply exercise edits
      const exercises = (baseModule as any).handsOnExercises?.map((exercise: Exercise) => {
        const exerciseEdit = edits.exercises[exercise.id];
        return exerciseEdit ? { ...exercise, ...exerciseEdit } : exercise;
      }) || [];

      // Apply project edits
      let project = (baseModule as any).assessmentProject;
      if (project && edits.projects[project.id]) {
        project = { ...project, ...edits.projects[project.id] };
      }

      return {
        ...baseModule,
        lessons,
        handsOnExercises: exercises,
        assessmentProject: project
      } as DetailedModule;
    });
  }

  /**
   * Get a single module by ID with all edits applied
   */
  static getModule(moduleId: string): DetailedModule | undefined {
    const allModules = this.getAllModules();
    return allModules.find(m => m.id === moduleId);
  }

  // Async wrappers for migration
  static async getAllModulesAsync(): Promise<DetailedModule[]> {
    // Try to fetch from Supabase curriculum tables first when configured
    if (isSupabaseConfigured()) {
      try {
        const data = await withRetries(() => supabaseCall(() => supabase
          .from('modules')
          .select('*, lessons(*), exercises(*), projects(*)')
        ), { retries: 2, timeoutMs: 5000 });

        if (data && Array.isArray(data)) {
          // If relational `curriculum_projects` not provided by the join,
          // attempt a fallback fetch from `projects` or `curriculum_projects`.
          const ensureProject = async (mod: any) => {
            if (mod.projects && mod.projects.length > 0) return mod.projects[0];
            try {
              const p1 = await supabase.from('projects').select('id,title').eq('module_id', mod.id).limit(1);
              if (!p1.error && Array.isArray(p1.data) && p1.data.length > 0) return p1.data[0];
            } catch { /* ignore */ }
            try {
              const p2 = await supabase.from('curriculum_projects').select('id,title').eq('module_id', mod.id).limit(1);
              if (!p2.error && Array.isArray(p2.data) && p2.data.length > 0) return p2.data[0];
            } catch { /* ignore */ }
            return undefined;
          };

          const mapped = await Promise.all(data.map(async (m: any) => ({
            id: m.id,
            week: m.week_number || 0,
            title: m.title,
            description: m.description || '',
            category: m.track || 'Beginner',
            lessons: (m.lessons || []).map((l: any) => ({
              id: l.id,
              title: l.title,
              description: l.content || '',
              order_index: l.order_index,
              estimated_minutes: l.estimated_minutes
            })),
            handsOnExercises: (m.exercises || []).map((e: any) => ({
              id: e.id,
              title: e.title,
              description: e.description,
              starter_code: e.starter_code,
              difficulty: e.difficulty,
              order_index: e.order_index
            })),
            assessmentProject: (m.projects && m.projects.length > 0) ? m.projects[0] : undefined,
            lessons_count: (m.lessons || []).length,
            estimatedHours: m.estimated_hours || 0,
            isDeleted: false
          } as DetailedModule)));

          // Resolve assessmentProject for modules missing relational data
          for (let i = 0; i < mapped.length; i++) {
            if (!mapped[i].assessmentProject) {
              const proj = await ensureProject(data[i]);
              if (proj) mapped[i].assessmentProject = { id: proj.id, title: proj.title } as any;
            }
          }

          return mapped;
        }
      } catch (err) {
        // fall through to local data fallback (silent)
      }
    }

    try {
      return Promise.resolve(this.getAllModules());
    } catch (err) {
      return Promise.resolve([]);
    }
  }

  static async getModuleAsync(moduleId: string): Promise<DetailedModule | undefined> {
    if (isSupabaseConfigured()) {
      try {
        const data = await withRetries(() => supabaseCall(() => supabase
          .from('modules')
          .select('*, lessons(*), exercises(*), projects(*)')
          .eq('id', moduleId)
          .limit(1)
        ), { retries: 2, timeoutMs: 4000 });

        if (data && Array.isArray(data) && data.length > 0) {
          const m = data[0];
          // Ensure assessment project present: try fallback tables if necessary
          if (!(m.projects && m.projects.length > 0)) {
            try {
              const p1 = await supabase.from('projects').select('id,title').eq('module_id', m.id).limit(1);
              if (!p1.error && Array.isArray(p1.data) && p1.data.length > 0) m.projects = p1.data;
              else {
                const p2 = await supabase.from('curriculum_projects').select('id,title').eq('module_id', m.id).limit(1);
                if (!p2.error && Array.isArray(p2.data) && p2.data.length > 0) m.projects = p2.data;
              }
            } catch {
              // ignore fallback failures
            }
          }

          return {
            id: m.id,
            week: m.week_number || 0,
            title: m.title,
            description: m.description || '',
            category: m.track || 'Beginner',
            lessons: (m.lessons || []).map((l: any) => ({
              id: l.id,
              title: l.title,
              description: l.content || '',
              order_index: l.order_index,
              estimated_minutes: l.estimated_minutes
            })),
            handsOnExercises: (m.exercises || []).map((e: any) => ({
              id: e.id,
              title: e.title,
              description: e.description,
              starter_code: e.starter_code,
              difficulty: e.difficulty,
              order_index: e.order_index
            })),
            assessmentProject: (m.projects && m.projects.length > 0) ? m.projects[0] : undefined,
            lessons_count: (m.lessons || []).length,
            estimatedHours: m.estimated_hours || 0,
            isDeleted: false
          } as DetailedModule;
        }
      } catch (err) {
        // fallback (silent)
      }
    }

    try {
      return Promise.resolve(this.getModule(moduleId));
    } catch (err) {
      return Promise.resolve(undefined);
    }
  }

  // Async write helpers (wrap existing sync behavior for gradual migration)
  static async saveModuleAsync(moduleId: string, updates: Partial<DetailedModule>): Promise<void> {
    return withRetries(() => Promise.resolve(this.saveModule(moduleId, updates)), { retries: 3, timeoutMs: 3000 });
  }

  static async deleteModuleAsync(moduleId: string): Promise<void> {
    return withRetries(() => Promise.resolve(this.deleteModule(moduleId)), { retries: 3, timeoutMs: 3000 });
  }

  static async setPublishStatusAsync(contentId: string, isPublished: boolean): Promise<void> {
    return withRetries(() => Promise.resolve(this.setPublishStatus(contentId, isPublished)), { retries: 3, timeoutMs: 3000 });
  }

  static async importContentAsync(jsonData: string): Promise<void> {
    return withRetries(() => Promise.resolve(this.importContent(jsonData)), { retries: 3, timeoutMs: 5000 });
  }

  static async clearAllEditsAsync(): Promise<void> {
    return withRetries(() => Promise.resolve(this.clearAllEdits()), { retries: 3, timeoutMs: 5000 });
  }

  /**
   * Save module edits
   */
  static saveModule(moduleId: string, updates: Partial<DetailedModule>): void {
    try {
      const edits = this.getEdits();
      edits.modules[moduleId] = {
        ...edits.modules[moduleId],
        ...updates
      };

      this.saveEdits(edits);
      this.notifyUpdate('module', moduleId);
    } catch (error) {
      console.error('Error saving module:', error);
      throw error;
    }
  }

  /**
   * Delete a module (mark as deleted, not hard delete)
   */
  static deleteModule(moduleId: string): void {
    try {
      const edits = this.getEdits();
      edits.modules[moduleId] = {
        ...edits.modules[moduleId],
        isDeleted: true
      } as any;

      this.saveEdits(edits);
      this.notifyUpdate('module', moduleId);
    } catch (error) {
      console.error('Error deleting module:', error);
      throw error;
    }
  }

  // ========== LESSON MANAGEMENT ==========

  /**
   * Get all lessons from a specific module
   */
  static getLessonsByModule(moduleId: string): DetailedLesson[] {
    const module = this.getModule(moduleId);
    return module?.lessons || [];
  }

  /**
   * Get a single lesson by ID
   */
  static getLesson(moduleId: string, lessonId: string): DetailedLesson | undefined {
    const lessons = this.getLessonsByModule(moduleId);
    return lessons.find(l => l.id === lessonId);
  }

  /**
   * Save lesson edits
   */
  static saveLesson(moduleId: string, lessonId: string, updates: Partial<DetailedLesson>): void {
    try {
      const edits = this.getEdits();
      edits.lessons[lessonId] = {
        ...edits.lessons[lessonId],
        ...updates
      };

      this.saveEdits(edits);
      this.notifyUpdate('lesson', lessonId, moduleId);
    } catch (error) {
      console.error('Error saving lesson:', error);
      throw error;
    }
  }

  /**
   * Add a new lesson to a module
   */
  static addLesson(moduleId: string, lesson: DetailedLesson): void {
    try {
      const edits = this.getEdits();
      const module = this.getModule(moduleId);

      if (!module) throw new Error('Module not found');

      const currentLessons = edits.modules[moduleId]?.lessons || module.lessons || [];

      edits.modules[moduleId] = {
        ...edits.modules[moduleId],
        lessons: [...currentLessons, lesson]
      } as any;

      this.saveEdits(edits);
      this.notifyUpdate('lesson', lesson.id, moduleId);
    } catch (error) {
      console.error('Error adding lesson:', error);
      throw error;
    }
  }

  /**
   * Delete a lesson from a module
   */
  static deleteLesson(moduleId: string, lessonId: string): void {
    try {
      const edits = this.getEdits();
      const module = this.getModule(moduleId);

      if (!module) throw new Error('Module not found');

      const currentLessons = (edits.modules[moduleId]?.lessons || module.lessons || []) as DetailedLesson[];
      const updatedLessons = currentLessons.filter(l => l.id !== lessonId);

      edits.modules[moduleId] = {
        ...edits.modules[moduleId],
        lessons: updatedLessons
      } as any;

      this.saveEdits(edits);
      this.notifyUpdate('lesson', lessonId, moduleId);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      throw error;
    }
  }

  // ========== EXERCISE MANAGEMENT ==========

  /**
   * Get all exercises from a specific module
   */
  static getExercisesByModule(moduleId: string): Exercise[] {
    const module = this.getModule(moduleId);
    return (module as any)?.handsOnExercises || [];
  }

  /**
   * Get a single exercise by ID
   */
  static getExercise(moduleId: string, exerciseId: string): Exercise | undefined {
    const exercises = this.getExercisesByModule(moduleId);
    return exercises.find(e => e.id === exerciseId);
  }

  /**
   * Save exercise edits
   */
  static saveExercise(moduleId: string, exerciseId: string, updates: Partial<Exercise>): void {
    try {
      const edits = this.getEdits();
      edits.exercises[exerciseId] = {
        ...edits.exercises[exerciseId],
        ...updates
      };

      this.saveEdits(edits);
      this.notifyUpdate('exercise', exerciseId, moduleId);
    } catch (error) {
      console.error('Error saving exercise:', error);
      throw error;
    }
  }

  /**
   * Add a new exercise to a module
   */
  static addExercise(moduleId: string, exercise: Exercise): void {
    try {
      const edits = this.getEdits();
      const module = this.getModule(moduleId);

      if (!module) throw new Error('Module not found');

      const currentExercises = (edits.modules[moduleId] as any)?.handsOnExercises || (module as any).handsOnExercises || [];

      edits.modules[moduleId] = {
        ...edits.modules[moduleId],
        handsOnExercises: [...currentExercises, exercise]
      } as any;

      this.saveEdits(edits);
      this.notifyUpdate('exercise', exercise.id, moduleId);
    } catch (error) {
      console.error('Error adding exercise:', error);
      throw error;
    }
  }

  /**
   * Delete an exercise from a module
   */
  static deleteExercise(moduleId: string, exerciseId: string): void {
    try {
      const edits = this.getEdits();
      const module = this.getModule(moduleId);

      if (!module) throw new Error('Module not found');

      const currentExercises = ((edits.modules[moduleId] as any)?.handsOnExercises || (module as any).handsOnExercises || []) as Exercise[];
      const updatedExercises = currentExercises.filter(e => e.id !== exerciseId);

      edits.modules[moduleId] = {
        ...edits.modules[moduleId],
        handsOnExercises: updatedExercises
      } as any;

      this.saveEdits(edits);
      this.notifyUpdate('exercise', exerciseId, moduleId);
    } catch (error) {
      console.error('Error deleting exercise:', error);
      throw error;
    }
  }

  // ========== PROJECT MANAGEMENT ==========

  /**
   * Get project from a specific module
   */
  static getProjectByModule(moduleId: string): Project | undefined {
    const module = this.getModule(moduleId);
    return (module as any)?.assessmentProject;
  }

  /**
   * Save project edits
   */
  static saveProject(moduleId: string, projectId: string, updates: Partial<Project>): void {
    try {
      const edits = this.getEdits();
      edits.projects[projectId] = {
        ...edits.projects[projectId],
        ...updates
      };

      this.saveEdits(edits);
      this.notifyUpdate('project', projectId, moduleId);
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  }

  /**
   * Set/Update the project for a module
   */
  static setModuleProject(moduleId: string, project: Project): void {
    try {
      const edits = this.getEdits();

      edits.modules[moduleId] = {
        ...edits.modules[moduleId],
        assessmentProject: project
      } as any;

      this.saveEdits(edits);
      this.notifyUpdate('project', project.id, moduleId);
    } catch (error) {
      console.error('Error setting module project:', error);
      throw error;
    }
  }

  /**
   * Remove project from a module
   */
  static deleteProject(moduleId: string): void {
    try {
      const edits = this.getEdits();

      edits.modules[moduleId] = {
        ...edits.modules[moduleId],
        assessmentProject: undefined
      } as any;

      this.saveEdits(edits);
      this.notifyUpdate('project', moduleId, moduleId);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // ========== PUBLISH STATUS MANAGEMENT ==========

  /**
   * Get publish status for any content item
   */
  static isPublished(contentId: string): boolean {
    const edits = this.getEdits();
    // Default to published (true) unless explicitly set to false
    return edits.publishStatus[contentId] !== false;
  }

  /**
   * Set publish status for any content item
   */
  static setPublishStatus(contentId: string, isPublished: boolean): void {
    try {
      const edits = this.getEdits();
      edits.publishStatus[contentId] = isPublished;

      this.saveEdits(edits);
      this.notifyUpdate('publishStatus', contentId);
    } catch (error) {
      console.error('Error setting publish status:', error);
      throw error;
    }
  }

  // ========== UTILITY METHODS ==========

  /**
   * Get all content edits
   * SUPABASE TODO: Query from content_edits table
   */
  private static getEdits(): ContentEdits {
    try {
      if (typeof window === 'undefined') {
        return this.getEmptyEdits();
      }

      // DISABLED FOR SUPABASE MIGRATION
      // const stored = localStorage.getItem(this.CONTENT_KEY);
      // if (!stored) return this.getEmptyEdits();

      // const edits = JSON.parse(stored);

      // // Ensure all required properties exist
      // return {
      //   modules: edits.modules || {},
      //   lessons: edits.lessons || {},
      //   exercises: edits.exercises || {},
      //   projects: edits.projects || {},
      //   publishStatus: edits.publishStatus || {}
      // };

      return this.getEmptyEdits();
    } catch (error) {
      console.error('Error loading content edits:', error);
      return this.getEmptyEdits();
    }
  }

  /**
   * Save all content edits
   * SUPABASE TODO: Save to content_edits table
   */
  private static saveEdits(_edits: ContentEdits): void {
    try {
      if (typeof window === 'undefined') return;
      // Persist edits to Supabase `content_edits` table when configured.
      // Run in background so callers remain synchronous (existing API preserved).
      if (isSupabaseConfigured()) {
        (async () => {
          try {
            const rows: any[] = [];

            // Module edits
            for (const [moduleId, edit] of Object.entries(_edits.modules || {})) {
              rows.push({ module_id: moduleId, edit_type: 'module', edit_data: edit });
            }

            // Lesson edits
            for (const [lessonId, edit] of Object.entries(_edits.lessons || {})) {
              rows.push({ module_id: (edit as any).moduleId || null, edit_type: 'lesson', edit_data: { id: lessonId, ...edit } });
            }

            // Exercise edits
            for (const [exerciseId, edit] of Object.entries(_edits.exercises || {})) {
              rows.push({ module_id: (edit as any).moduleId || null, edit_type: 'exercise', edit_data: { id: exerciseId, ...edit } });
            }

            // Project edits
            for (const [projectId, edit] of Object.entries(_edits.projects || {})) {
              rows.push({ module_id: (edit as any).moduleId || null, edit_type: 'project', edit_data: { id: projectId, ...edit } });
            }

            if (rows.length > 0) {
              await withRetries(() => supabaseCall(() => supabase.from('content_edits').insert(rows)), { retries: 2, timeoutMs: 4000 });
            }
          } catch (err) {
            // Swallow errors to avoid breaking UI; log for diagnostics (silent)
          }
        })();
      }
    } catch (error) {
      console.error('Error saving content edits:', error);
    }
  }

  /**
   * Get empty edits structure
   */
  private static getEmptyEdits(): ContentEdits {
    return {
      modules: {},
      lessons: {},
      exercises: {},
      projects: {},
      publishStatus: {}
    };
  }

  /**
   * Notify all listeners about content updates
   */
  private static notifyUpdate(type: string, contentId: string, moduleId?: string): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('contentUpdated', {
        detail: { type, contentId, moduleId, timestamp: Date.now() }
      }));
    }
  }

  /**
   * Check if content has edits
   */
  static hasEdits(type: 'module' | 'lesson' | 'exercise' | 'project', contentId: string): boolean {
    const edits = this.getEdits();

    switch (type) {
      case 'module':
        return !!edits.modules[contentId];
      case 'lesson':
        return !!edits.lessons[contentId];
      case 'exercise':
        return !!edits.exercises[contentId];
      case 'project':
        return !!edits.projects[contentId];
      default:
        return false;
    }
  }

  /**
   * Clear all edits (admin function)
   * SUPABASE TODO: Delete all from content_edits table
   */
  static clearAllEdits(): void {
    try {
      if (typeof window === 'undefined') return;

      // DISABLED FOR SUPABASE MIGRATION
      // localStorage.removeItem(this.CONTENT_KEY);
      this.notifyUpdate('clearAll', 'all');
    } catch (error) {
      console.error('Error clearing all edits:', error);
      throw error;
    }
  }

  /**
   * Clear edits for specific content
   */
  static clearContentEdits(type: 'module' | 'lesson' | 'exercise' | 'project', contentId: string): void {
    try {
      const edits = this.getEdits();

      switch (type) {
        case 'module':
          delete edits.modules[contentId];
          break;
        case 'lesson':
          delete edits.lessons[contentId];
          break;
        case 'exercise':
          delete edits.exercises[contentId];
          break;
        case 'project':
          delete edits.projects[contentId];
          break;
      }

      this.saveEdits(edits);
      this.notifyUpdate('clear', contentId);
    } catch (error) {
      console.error('Error clearing content edits:', error);
      throw error;
    }
  }

  /**
   * Export all content for backup
   */
  static exportContent(): string {
    const edits = this.getEdits();
    const exportData = {
      modules: edits.modules,
      lessons: edits.lessons,
      exercises: edits.exercises,
      projects: edits.projects,
      publishStatus: edits.publishStatus,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import content from backup
   */
  static importContent(jsonData: string): void {
    try {
      const importData = JSON.parse(jsonData);

      // Validate structure
      if (!importData.modules && !importData.lessons && !importData.exercises && !importData.projects) {
        throw new Error('Invalid import data structure');
      }

      const edits: ContentEdits = {
        modules: importData.modules || {},
        lessons: importData.lessons || {},
        exercises: importData.exercises || {},
        projects: importData.projects || {},
        publishStatus: importData.publishStatus || {}
      };

      this.saveEdits(edits);
      this.notifyUpdate('import', 'all');
    } catch (error) {
      console.error('Error importing content:', error);
      throw error;
    }
  }

  /**
   * Get content statistics
   */
  static getContentStats() {
    const modules = this.getAllModules();

    let totalLessons = 0;
    let totalExercises = 0;
    let totalProjects = 0;
    let publishedModules = 0;

    modules.forEach(module => {
      totalLessons += module.lessons?.length || 0;
      totalExercises += (module as any).handsOnExercises?.length || 0;
      if ((module as any).assessmentProject) totalProjects++;
      if (this.isPublished(module.id)) publishedModules++;
    });

    return {
      totalModules: modules.length,
      publishedModules,
      totalLessons,
      totalExercises,
      totalProjects,
      totalContent: totalLessons + totalExercises + totalProjects
    };
  }
}

export default ContentManager;
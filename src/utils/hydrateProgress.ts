import { supabase } from './supabase/client';
import { UserProgress, ModuleDetailedProgress } from './progressSyncManager';

type LessonRow = { module_id: string; lesson_id: string; xp_earned?: number; completed_at?: string; lesson_title?: string };
type ExerciseRow = { module_id: string; exercise_id: string; xp_earned?: number; completed_at?: string };
type ProjectRow = { module_id: string; project_id: string; xp_earned?: number; completed_at?: string };
type ModuleRow = { module_id: string; lessons_completed?: number; exercises_completed?: number; projects_completed?: number; xp_earned?: number; is_completed?: boolean; is_locked?: boolean };

function buildClientUserProgress(opts: {
  userProgressRowData: any | null;
  lessonRows: LessonRow[];
  exerciseRows: ExerciseRow[];
  projectRows: ProjectRow[];
  moduleProgressRows?: ModuleRow[];
}): UserProgress {
  const { userProgressRowData, lessonRows, exerciseRows, projectRows, moduleProgressRows = [] } = opts;

  const moduleMap: Record<string, { completedLessons: string[]; completedExercises: string[]; projectCompleted: boolean; _xpSum: number }> = {};

  const ensureModule = (id: string) => {
    if (!moduleMap[id]) moduleMap[id] = { completedLessons: [], completedExercises: [], projectCompleted: false, _xpSum: 0 };
    return moduleMap[id];
  };

  for (const r of lessonRows || []) {
    if (!r || !r.module_id) continue;
    const m = ensureModule(r.module_id);
    if (!m.completedLessons.includes(r.lesson_id)) m.completedLessons.push(r.lesson_id);
    m._xpSum += Number(r.xp_earned || 0);
  }

  for (const r of exerciseRows || []) {
    if (!r || !r.module_id) continue;
    const m = ensureModule(r.module_id);
    if (!m.completedExercises.includes(r.exercise_id)) m.completedExercises.push(r.exercise_id);
    m._xpSum += Number(r.xp_earned || 0);
  }

  for (const r of projectRows || []) {
    if (!r || !r.module_id) continue;
    const m = ensureModule(r.module_id);
    m.projectCompleted = true;
    m._xpSum += Number(r.xp_earned || 0);
  }

  // Reconcile optional module_progress counters (keep arrays derived from per-item rows)
  const moduleCounters: Record<string, ModuleRow> = {};
  for (const mr of moduleProgressRows || []) {
    if (!mr || !mr.module_id) continue;
    moduleCounters[mr.module_id] = mr;
    ensureModule(mr.module_id);
  }

  const finalModuleProgress: { [moduleId: string]: ModuleDetailedProgress & { _clientXP?: number } } = {};
  for (const moduleId of Object.keys(moduleMap)) {
    const m = moduleMap[moduleId];
    finalModuleProgress[moduleId] = {
      completedLessons: m.completedLessons.slice(),
      completedExercises: m.completedExercises.slice(),
      projectCompleted: !!m.projectCompleted,
      exerciseCodes: {},
      projectCode: undefined,
      lessonOrder: [],
      unlockedLessons: [],
      unlockedExercises: [],
      completed: !!(moduleCounters[moduleId]?.is_completed || m.completedLessons.length > 0 || m.completedExercises.length > 0 || m.projectCompleted),
      // attach non-authoritative per-module xp for UI breakdown
      _clientXP: m._xpSum
    } as any;
  }

  // If there are module rows that had no per-item rows, include them too
  for (const [mid, mr] of Object.entries(moduleCounters)) {
    if (finalModuleProgress[mid]) continue;
    finalModuleProgress[mid] = {
      completedLessons: [],
      completedExercises: [],
      projectCompleted: !!mr.projects_completed && mr.projects_completed > 0,
      exerciseCodes: {},
      projectCode: undefined,
      lessonOrder: [],
      unlockedLessons: [],
      unlockedExercises: [],
      completed: !!mr.is_completed,
      _clientXP: Number(mr.xp_earned || 0)
    } as any;
  }

  const totalXP = userProgressRowData ? Number(userProgressRowData.total_xp || 0) : 0;
  const lessonsCompleted = userProgressRowData ? Number(userProgressRowData.lessons_completed || 0) : Object.values(finalModuleProgress).reduce((s, m) => s + (m.completedLessons?.length || 0), 0);
  const exercisesCompleted = userProgressRowData ? Number(userProgressRowData.exercises_completed || 0) : Object.values(finalModuleProgress).reduce((s, m) => s + (m.completedExercises?.length || 0), 0);
  const projectsCompleted = userProgressRowData ? Number(userProgressRowData.projects_completed || 0) : Object.values(finalModuleProgress).reduce((s, m) => s + (m.projectCompleted ? 1 : 0), 0);

  const completedModules = Object.keys(finalModuleProgress).filter(mid => !!finalModuleProgress[mid].completed);

  const userProgress: UserProgress = {
    lastUpdated: userProgressRowData ? userProgressRowData.updated_at : new Date().toISOString(),
    currentStreak: undefined,
    longestStreak: undefined,
    lastActivityDate: undefined,
    dailyActivity: {},
    moduleProgress: finalModuleProgress as any,
    completedModules,
    total_xp: totalXP,
    lessons_completed: lessonsCompleted,
    exercises_completed: exercisesCompleted,
    projects_completed: projectsCompleted,
    assessments: []
  } as UserProgress;

  return userProgress;
}

export async function hydrateUserProgress(userId: string): Promise<UserProgress> {
  if (!userId) throw new Error('userId required');

  // Fetch authoritative user_progress row
  let upRow: any = null;
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('user_id,total_xp,lessons_completed,exercises_completed,projects_completed,modules_completed,updated_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) console.warn('[hydrateUserProgress] user_progress fetch error', error);
    upRow = data || null;
  } catch (e) {
    console.warn('[hydrateUserProgress] user_progress fetch threw', e);
    upRow = null;
  }

  // Fetch per-item completions in parallel
  const [lcRes, ecRes, pcRes, mpRes] = await Promise.all([
    supabase.from('lesson_completions').select('module_id,lesson_id,xp_earned,completed_at,lesson_title').eq('user_id', userId),
    supabase.from('exercise_completions').select('module_id,exercise_id,xp_earned,completed_at').eq('user_id', userId),
    supabase.from('project_completions').select('module_id,project_id,xp_earned,completed_at').eq('user_id', userId),
    supabase.from('module_progress').select('module_id,lessons_completed,exercises_completed,projects_completed,xp_earned,is_completed,is_locked').eq('user_id', userId)
  ]);

  const lessonRows: LessonRow[] = lcRes?.data || [];
  const exerciseRows: ExerciseRow[] = ecRes?.data || [];
  const projectRows: ProjectRow[] = pcRes?.data || [];
  const moduleRows: ModuleRow[] = mpRes?.data || [];

  if (lcRes?.error) console.warn('[hydrateUserProgress] lesson_completions fetch error', lcRes.error);
  if (ecRes?.error) console.warn('[hydrateUserProgress] exercise_completions fetch error', ecRes.error);
  if (pcRes?.error) console.warn('[hydrateUserProgress] project_completions fetch error', pcRes.error);
  if (mpRes?.error) console.warn('[hydrateUserProgress] module_progress fetch error', mpRes.error);

  const merged = buildClientUserProgress({ userProgressRowData: upRow, lessonRows, exerciseRows, projectRows, moduleProgressRows: moduleRows });
  return merged;
}

export default hydrateUserProgress;

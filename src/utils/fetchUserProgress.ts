import { supabase } from './supabase/client';
import { UserProgress, ModuleDetailedProgress } from './progressSyncManager';

type LessonRow = { module_id: string; lesson_id: string; xp_earned?: number; completed_at?: string; lesson_title?: string };
type ExerciseRow = { module_id: string; exercise_id: string; xp_earned?: number; completed_at?: string };
type ProjectRow = { module_id: string; project_id: string; xp_earned?: number; completed_at?: string };
type ModuleRow = { module_id: string; lessons_completed?: number; exercises_completed?: number; projects_completed?: number; xp_earned?: number; is_completed?: boolean; is_locked?: boolean };

function makeDefaultProgress(): UserProgress {
  return {
    lastUpdated: new Date().toISOString(),
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: undefined,
    dailyActivity: {},
    moduleProgress: {},
    completedModules: [],
    total_xp: 0,
    lessons_completed: 0,
    exercises_completed: 0,
    projects_completed: 0,
    assessments: []
  } as UserProgress;
}

function buildFromRows(opts: {
  userProgressRow: any | null;
  lessonRows: LessonRow[];
  exerciseRows: ExerciseRow[];
  projectRows: ProjectRow[];
  moduleRows?: ModuleRow[];
}): UserProgress {
  const { userProgressRow, lessonRows, exerciseRows, projectRows, moduleRows = [] } = opts;

  const moduleMap: Record<string, { completedLessons: string[]; completedExercises: string[]; projectCompleted: boolean; _xpSum: number }> = {};
  const ensure = (id: string) => {
    if (!moduleMap[id]) moduleMap[id] = { completedLessons: [], completedExercises: [], projectCompleted: false, _xpSum: 0 };
    return moduleMap[id];
  };

  for (const r of lessonRows || []) {
    if (!r || !r.module_id) continue;
    const m = ensure(r.module_id);
    if (!m.completedLessons.includes(r.lesson_id)) m.completedLessons.push(r.lesson_id);
    m._xpSum += Number(r.xp_earned || 0);
  }
  for (const r of exerciseRows || []) {
    if (!r || !r.module_id) continue;
    const m = ensure(r.module_id);
    if (!m.completedExercises.includes(r.exercise_id)) m.completedExercises.push(r.exercise_id);
    m._xpSum += Number(r.xp_earned || 0);
  }
  for (const r of projectRows || []) {
    if (!r || !r.module_id) continue;
    const m = ensure(r.module_id);
    m.projectCompleted = true;
    m._xpSum += Number(r.xp_earned || 0);
  }

  const moduleCounters: Record<string, ModuleRow> = {};
  for (const mr of moduleRows || []) {
    if (!mr || !mr.module_id) continue;
    moduleCounters[mr.module_id] = mr;
    ensure(mr.module_id);
  }

  const moduleProgress: { [k: string]: ModuleDetailedProgress & { _clientXP?: number } } = {};
  for (const [mid, m] of Object.entries(moduleMap)) {
    moduleProgress[mid] = {
      completedLessons: m.completedLessons.slice(),
      completedExercises: m.completedExercises.slice(),
      projectCompleted: !!m.projectCompleted,
      exerciseCodes: {},
      projectCode: undefined,
      lessonOrder: [],
      unlockedLessons: [],
      unlockedExercises: [],
      completed: !!(moduleCounters[mid]?.is_completed || m.completedLessons.length > 0 || m.completedExercises.length > 0 || m.projectCompleted),
      _clientXP: m._xpSum
    } as any;
  }
  for (const [mid, mr] of Object.entries(moduleCounters)) {
    if (moduleProgress[mid]) continue;
    moduleProgress[mid] = {
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

  const totalXP = userProgressRow ? Number(userProgressRow.total_xp || 0) : 0;
  const lessons_completed = userProgressRow ? Number(userProgressRow.lessons_completed || 0) : Object.values(moduleProgress).reduce((s, m) => s + (m.completedLessons?.length || 0), 0);
  const exercises_completed = userProgressRow ? Number(userProgressRow.exercises_completed || 0) : Object.values(moduleProgress).reduce((s, m) => s + (m.completedExercises?.length || 0), 0);
  const projects_completed = userProgressRow ? Number(userProgressRow.projects_completed || 0) : Object.values(moduleProgress).reduce((s, m) => s + (m.projectCompleted ? 1 : 0), 0);

  const completedModules = Object.keys(moduleProgress).filter(k => !!moduleProgress[k].completed);

  const out: UserProgress = {
    lastUpdated: userProgressRow ? userProgressRow.updated_at : new Date().toISOString(),
    currentStreak: undefined,
    longestStreak: undefined,
    lastActivityDate: undefined,
    dailyActivity: {},
    moduleProgress: moduleProgress as any,
    completedModules,
    total_xp: totalXP,
    lessons_completed,
    exercises_completed,
    projects_completed,
    assessments: []
  } as UserProgress;

  return out;
}

export async function fetchUserProgress(userId: string): Promise<UserProgress> {
  if (!userId) return makeDefaultProgress();

  // authoritative user_progress
  let upRow: any = null;
  try {
    const { data, error } = await supabase.from('user_progress').select('user_id,total_xp,lessons_completed,exercises_completed,projects_completed,modules_completed,updated_at').eq('user_id', userId).maybeSingle();
    if (error) console.warn('[fetchUserProgress] user_progress error', error);
    upRow = data || null;
  } catch (e) {
    console.warn('[fetchUserProgress] user_progress fetch threw', e);
    upRow = null;
  }

  // per-item rows
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

  if (lcRes?.error) console.warn('[fetchUserProgress] lesson_completions error', lcRes.error);
  if (ecRes?.error) console.warn('[fetchUserProgress] exercise_completions error', ecRes.error);
  if (pcRes?.error) console.warn('[fetchUserProgress] project_completions error', pcRes.error);
  if (mpRes?.error) console.warn('[fetchUserProgress] module_progress error', mpRes.error);

  // If there are no rows and no user_progress row, return default empty progress
  if (!upRow && !lessonRows.length && !exerciseRows.length && !projectRows.length && !moduleRows.length) return makeDefaultProgress();

  const merged = buildFromRows({ userProgressRow: upRow, lessonRows, exerciseRows, projectRows, moduleRows });
  return merged;
}

export default fetchUserProgress;

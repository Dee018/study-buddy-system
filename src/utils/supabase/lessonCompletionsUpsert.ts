// Helper to prepare safe lesson_completions rows for Supabase insert
type IncomingLesson = Partial<{
  id: string;
  module_id: string;
  lesson_id: string;
  lesson_title: string;
  xp_earned: number;
  time_spent_minutes: number;
  completed_at: string;
  created_at: string;
  updated_at: string;
}>;

export type LessonCompletionInsert = {
  id: string;
  user_id: string;
  module_id: string;
  lesson_id: string;
  lesson_title: string;
  xp_earned: number;
  time_spent_minutes: number;
  completed_at: string;
  created_at: string;
};

const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(v?: string | null): v is string {
  return typeof v === 'string' && uuidV4Regex.test(v);
}

function generateUUIDv4() {
  try {
    if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') return (crypto as any).randomUUID();
  } catch { /* ignore */ }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function toISO(v?: string | null): string {
  if (!v) return new Date().toISOString();
  const d = new Date(v);
  if (isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

/**
 * Prepare an array of lesson rows suitable for `supabase.from('lesson_completions').insert(...)`.
 * - Validates `userId` is a UUID
 * - Ensures each row contains exactly the allowed columns
 * - Fills defaults for missing fields (id, xp_earned, time_spent_minutes, completed_at, created_at)
 */
export function prepareLessonCompletionsForInsert(lessons: IncomingLesson[], userId: string): LessonCompletionInsert[] {
  if (!isValidUUID(userId)) throw new Error('userId must be a valid UUID');
  const now = new Date().toISOString();

  return (lessons || []).map((l) => {
    const id = isValidUUID(l.id) ? l.id! : generateUUIDv4();
    const module_id = typeof l.module_id === 'string' ? l.module_id : (l.lesson_id ? l.lesson_id.split('-').slice(0, 2).join('-') : 'unknown-module');
    const lesson_id = typeof l.lesson_id === 'string' ? l.lesson_id : (l.lesson_title ? l.lesson_title.replace(/\s+/g, '-').toLowerCase() : `lesson-${Math.floor(Math.random() * 100000)}`);
    const lesson_title = typeof l.lesson_title === 'string' ? l.lesson_title : lesson_id;
    const xp_earned = Number.isFinite(l.xp_earned as number) ? (l.xp_earned as number) : 0;
    const time_spent_minutes = Number.isFinite(l.time_spent_minutes as number) ? (l.time_spent_minutes as number) : 0;
    const completed_at = toISO(l.completed_at ?? now);
    const created_at = toISO(l.created_at ?? now);

    // Return object with exactly the allowed fields (no extras)
    const out: LessonCompletionInsert = {
      id,
      user_id: userId,
      module_id,
      lesson_id,
      lesson_title,
      xp_earned,
      time_spent_minutes,
      completed_at,
      created_at
    };

    return out;
  });
}

export default prepareLessonCompletionsForInsert;

-- Backfill summary columns for ALL users from the `progress` JSONB
-- Usage: run in Supabase SQL editor. Recommended: run on a backup/staging first.
-- This query is idempotent and only updates rows where `progress` is present.

BEGIN;

WITH src AS (
  SELECT id, progress FROM user_progress WHERE progress IS NOT NULL
)

UPDATE user_progress up
SET
  total_xp = COALESCE(NULLIF((s.progress->> 'total_xp'),'')::int, NULLIF((s.progress->> 'totalXp'),'')::int, up.total_xp),
  current_level = COALESCE(NULLIF((s.progress->> 'level'),'')::text, up.current_level),
  current_streak = COALESCE(NULLIF((s.progress->> 'currentStreak'),'')::int, NULLIF((s.progress->> 'current_streak'),'')::int, up.current_streak),
  longest_streak = COALESCE(NULLIF((s.progress->> 'longestStreak'),'')::int, NULLIF((s.progress->> 'longest_streak'),'')::int, up.longest_streak),
  last_activity_date = COALESCE(NULLIF(s.progress->> 'lastActivityDate','')::date, NULLIF(s.progress->> 'last_activity_date','')::date, up.last_activity_date),
  modules_completed = COALESCE(
    (CASE WHEN jsonb_typeof(s.progress->'completedModules') = 'array' THEN jsonb_array_length(s.progress->'completedModules') END),
    up.modules_completed
  ),
  lessons_completed = COALESCE(
    NULLIF((s.progress->> 'lessons_completed'),'')::int,
    NULLIF((s.progress->> 'lessonsCompleted'),'')::int,
    (CASE WHEN jsonb_typeof(s.progress->'completedLessons') = 'array' THEN jsonb_array_length(s.progress->'completedLessons') END),
    up.lessons_completed
  ),
  exercises_completed = COALESCE(
    NULLIF((s.progress->> 'exercises_completed'),'')::int,
    NULLIF((s.progress->> 'exercisesCompleted'),'')::int,
    (CASE WHEN jsonb_typeof(s.progress->'completedExercises') = 'array' THEN jsonb_array_length(s.progress->'completedExercises') END),
    up.exercises_completed
  ),
  projects_completed = COALESCE(
    NULLIF((s.progress->> 'projects_completed'),'')::int,
    (CASE WHEN jsonb_typeof(s.progress->'moduleProgress') = 'object' THEN (
      (SELECT COUNT(*) FROM jsonb_each(s.progress->'moduleProgress') AS m(k,v) WHERE (m.v->>'projectCompleted')::text = 'true')
    ) END),
    up.projects_completed
  ),
  assessments_passed = COALESCE(
    (CASE WHEN jsonb_typeof(s.progress->'assessments') = 'array' THEN jsonb_array_length(s.progress->'assessments') END),
    up.assessments_passed
  ),
  total_study_time_minutes = COALESCE(
    (SELECT COALESCE(SUM((d.value->>'studyTimeMinutes')::int),0) FROM jsonb_each(s.progress->'dailyActivity') AS d(key,value)),
    up.total_study_time_minutes
  ),
  average_score = COALESCE(
    (SELECT AVG((a->>'score')::numeric) FROM jsonb_array_elements(s.progress->'assessments') AS a),
    up.average_score
  ),
  updated_at = now()
FROM src s
WHERE up.id = s.id;

COMMIT;

-- Verify results (example):
-- SELECT id,user_id,total_xp,current_level,current_streak,longest_streak,last_activity_date,lessons_completed,exercises_completed,projects_completed,assessments_passed,total_study_time_minutes,average_score,updated_at
-- FROM user_progress WHERE progress IS NOT NULL ORDER BY updated_at DESC LIMIT 50;

-- Sync a specific user's `user_progress` to the LearningHub `safeUserProgress` payload.
-- Run in Supabase SQL editor. Replace the user_id below if needed.

BEGIN;

-- Update existing row for this user (replace the UUID when running)
UPDATE user_progress
SET
  total_xp = 4765,
  current_level = '1',
  current_streak = 2,
  longest_streak = 2,
  last_activity_date = '2025-12-27',
  modules_completed = 0,
  lessons_completed = 22,
  exercises_completed = 21,
  projects_completed = 9,
  assessments_passed = 3,
  total_study_time_minutes = 917,
  average_score = NULL,
  progress = (
    '{
      "level": 1,
      "total_xp": 4765,
      "assessments": [
        {"score": 40, "topics": {"OOP": 100, "Arrays": 100, "Methods": 0, "Operators": 0, "Variables": 100, "Data Types": 0, "Inheritance": 0, "Java Basics": 100, "Access Modifiers": 0}, "maxScore": 100, "moduleId": "general-assessment", "completedAt": "2025-12-27T12:46:55.799Z", "assessmentId": "assessment-1-1766839615794"},
        {"score": 60, "topics": {"OOP": 100, "Arrays": 100, "Methods": 0, "Operators": 100, "Variables": 100, "Data Types": 0, "Inheritance": 0, "Java Basics": 100, "Access Modifiers": 100}, "maxScore": 100, "moduleId": "general-assessment", "completedAt": "2025-12-27T12:55:20.318Z", "assessmentId": "assessment-1-1766840120314"},
        {"score": 160, "topics": {"OOP": 100, "Arrays": 100, "Methods": 0, "Objects": 100, "Strings": 100, "File I/O": 0, "Operators": 100, "Variables": 100, "Data Types": 100, "Exceptions": 50, "Interfaces": 67, "OOP Basics": 0, "Inheritance": 0, "Java Basics": 100, "Constructors": 0, "Control Flow": 100, "Polymorphism": 100, "Access Control": 0, "Abstract Classes": 100, "Access Modifiers": 100, "Exception Handling": 0}, "maxScore": 300, "moduleId": "general-assessment", "completedAt": "2025-12-27T13:51:20.928Z", "assessmentId": "assessment-1-1766843480922"}
      ],
      "lastUpdated": "2025-12-28T04:51:51.991Z",
      "currentStreak": 2,
      "dailyActivity": {
        "2025-12-26": {"date": "2025-12-26", "totalXP": 3620, "lessonsCompleted": 20, "studyTimeLessons": 0, "studyTimeMinutes": 425, "projectsCompleted": 6, "studyTimeProjects": 0, "exercisesCompleted": 19, "studyTimeExercises": 0, "assessmentsCompleted": 0, "studyTimeAssessments": 0},
        "2025-12-27": {"date": "2025-12-27", "totalXP": 1145, "lessonsCompleted": 2, "studyTimeLessons": 0, "studyTimeMinutes": 424, "projectsCompleted": 2, "studyTimeProjects": 0, "exercisesCompleted": 2, "studyTimeExercises": 0, "assessmentsCompleted": 3, "studyTimeAssessments": 0},
        "2025-12-28": {"date": "2025-12-28", "totalXP": 0, "lessonsCompleted": 0, "studyTimeLessons": 0, "studyTimeMinutes": 68, "projectsCompleted": 0, "studyTimeProjects": 0, "exercisesCompleted": 0, "studyTimeExercises": 0, "assessmentsCompleted": 0, "studyTimeAssessments": 0}
      },
      "longestStreak": 2,
      "moduleProgress": {}
    }'::jsonb
  ),
  updated_at = now()
WHERE user_id = 'e8d92623-31f8-4186-960b-fbed49c1342b'::uuid;

-- If no row exists, insert one (lightweight upsert). The 'progress' payload above is large; you can insert a smaller JSONB or re-run UPDATE after inserting.
INSERT INTO user_progress (user_id, total_xp, current_level, current_streak, longest_streak, last_activity_date, modules_completed, lessons_completed, exercises_completed, projects_completed, assessments_passed, total_study_time_minutes, average_score, progress, created_at, updated_at)
SELECT
  u.id,
  4765,
  '1',
  2,
  2,
  '2025-12-27',
  0,
  22,
  21,
  9,
  3,
  917,
  NULL,
  '{}'::jsonb,
  now(),
  now()
FROM user_profiles u
WHERE u.id = 'e8d92623-31f8-4186-960b-fbed49c1342b'::uuid
  AND NOT EXISTS (SELECT 1 FROM user_progress up WHERE up.user_id = u.id);

COMMIT;

-- After running, verify with:
-- SELECT * FROM user_progress WHERE user_id = 'e8d92623-31f8-4186-960b-fbed49c1342b'::uuid;

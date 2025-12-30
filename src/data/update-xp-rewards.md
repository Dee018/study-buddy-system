# Update xp_reward statements (modules / lessons / exercises / projects)

## Modules
-- Beginner
UPDATE modules SET xp_reward = 150 WHERE id = 'beginner-module-1';
UPDATE modules SET xp_reward = 150 WHERE id = 'beginner-module-2';
UPDATE modules SET xp_reward = 150 WHERE id = 'beginner-module-3';
UPDATE modules SET xp_reward = 200 WHERE id = 'beginner-module-4';

-- Learner
UPDATE modules SET xp_reward = 200 WHERE id = 'learner-module-5';
UPDATE modules SET xp_reward = 200 WHERE id = 'learner-module-6';
UPDATE modules SET xp_reward = 200 WHERE id = 'learner-module-7';
UPDATE modules SET xp_reward = 200 WHERE id = 'learner-module-8';

-- Advanced
UPDATE modules SET xp_reward = 620 WHERE id = 'advanced-module-9';
UPDATE modules SET xp_reward = 670 WHERE id = 'advanced-module-10';
UPDATE modules SET xp_reward = 720 WHERE id = 'advanced-module-11';
UPDATE modules SET xp_reward = 700 WHERE id = 'advanced-module-12';

## Lessons
-- Beginner
UPDATE lessons SET xp_reward = 0 WHERE id = 'beginner-lesson-1-1';
UPDATE lessons SET xp_reward = 0 WHERE id = 'beginner-lesson-1-2';
UPDATE lessons SET xp_reward = 0 WHERE id = 'beginner-lesson-1-3';
UPDATE lessons SET xp_reward = 0 WHERE id = 'beginner-lesson-1-4';
UPDATE lessons SET xp_reward = 0 WHERE id = 'beginner-lesson-2-1';
UPDATE lessons SET xp_reward = 0 WHERE id = 'beginner-lesson-2-2';
UPDATE lessons SET xp_reward = 0 WHERE id = 'beginner-lesson-2-3';
UPDATE lessons SET xp_reward = 0 WHERE id = 'beginner-lesson-2-4';
UPDATE lessons SET xp_reward = 0 WHERE id = 'beginner-lesson-3-1';
UPDATE lessons SET xp_reward = 0 WHERE id = 'beginner-lesson-3-2';
UPDATE lessons SET xp_reward = 0 WHERE id = 'beginner-lesson-3-3';
UPDATE lessons SET xp_reward = 0 WHERE id = 'beginner-lesson-4-1';
UPDATE lessons SET xp_reward = 0 WHERE id = 'beginner-lesson-4-2';
UPDATE lessons SET xp_reward = 0 WHERE id = 'beginner-lesson-4-3';

-- Learner
UPDATE lessons SET xp_reward = 0 WHERE id = 'learner-lesson-5-1';
UPDATE lessons SET xp_reward = 0 WHERE id = 'learner-lesson-5-2';
UPDATE lessons SET xp_reward = 0 WHERE id = 'learner-lesson-6-1';
UPDATE lessons SET xp_reward = 0 WHERE id = 'learner-lesson-6-2';
UPDATE lessons SET xp_reward = 0 WHERE id = 'learner-lesson-7-1';
UPDATE lessons SET xp_reward = 0 WHERE id = 'learner-lesson-7-2';
UPDATE lessons SET xp_reward = 0 WHERE id = 'learner-lesson-8-1';
UPDATE lessons SET xp_reward = 0 WHERE id = 'learner-lesson-8-2';

-- Advanced
UPDATE lessons SET xp_reward = 0 WHERE id = 'advanced-lesson-9-1';
UPDATE lessons SET xp_reward = 0 WHERE id = 'advanced-lesson-9-2';
UPDATE lessons SET xp_reward = 0 WHERE id = 'advanced-lesson-9-3';
UPDATE lessons SET xp_reward = 0 WHERE id = 'advanced-lesson-10-1';
UPDATE lessons SET xp_reward = 0 WHERE id = 'advanced-lesson-10-2';
UPDATE lessons SET xp_reward = 0 WHERE id = 'advanced-lesson-10-3';
UPDATE lessons SET xp_reward = 0 WHERE id = 'advanced-lesson-11-1';
UPDATE lessons SET xp_reward = 0 WHERE id = 'advanced-lesson-11-2';
UPDATE lessons SET xp_reward = 0 WHERE id = 'advanced-lesson-11-3';
UPDATE lessons SET xp_reward = 0 WHERE id = 'advanced-lesson-12-1';
UPDATE lessons SET xp_reward = 0 WHERE id = 'advanced-lesson-12-2';
UPDATE lessons SET xp_reward = 0 WHERE id = 'advanced-lesson-12-3';
UPDATE lessons SET xp_reward = 0 WHERE id = 'advanced-lesson-12-4';

## Exercises
-- Beginner
UPDATE exercises SET xp_reward = 50 WHERE id = 'beginner-ex-1-1';
UPDATE exercises SET xp_reward = 75 WHERE id = 'beginner-ex-1-2';
UPDATE exercises SET xp_reward = 100 WHERE id = 'beginner-ex-1-3';
UPDATE exercises SET xp_reward = 50 WHERE id = 'beginner-ex-2-1';
UPDATE exercises SET xp_reward = 75 WHERE id = 'beginner-ex-2-2';
UPDATE exercises SET xp_reward = 50 WHERE id = 'beginner-ex-2-3';
UPDATE exercises SET xp_reward = 75 WHERE id = 'beginner-ex-2-4';
UPDATE exercises SET xp_reward = 50 WHERE id = 'beginner-ex-3-1';
UPDATE exercises SET xp_reward = 75 WHERE id = 'beginner-ex-3-2';
UPDATE exercises SET xp_reward = 75 WHERE id = 'beginner-ex-3-3';
UPDATE exercises SET xp_reward = 75 WHERE id = 'beginner-ex-4-1';
UPDATE exercises SET xp_reward = 75 WHERE id = 'beginner-ex-4-2';
UPDATE exercises SET xp_reward = 100 WHERE id = 'beginner-ex-4-3';

-- Learner
UPDATE exercises SET xp_reward = 50 WHERE id = 'learner-exercise-5-1';
UPDATE exercises SET xp_reward = 60 WHERE id = 'learner-exercise-5-2';
UPDATE exercises SET xp_reward = 60 WHERE id = 'learner-exercise-6-1';
UPDATE exercises SET xp_reward = 65 WHERE id = 'learner-exercise-6-2';
UPDATE exercises SET xp_reward = 65 WHERE id = 'learner-exercise-7-1';
UPDATE exercises SET xp_reward = 70 WHERE id = 'learner-exercise-7-2';
UPDATE exercises SET xp_reward = 60 WHERE id = 'learner-exercise-8-1';
UPDATE exercises SET xp_reward = 75 WHERE id = 'learner-exercise-8-2';

-- Advanced
UPDATE exercises SET xp_reward = 100 WHERE id = 'advanced-ex-9-1';
UPDATE exercises SET xp_reward = 120 WHERE id = 'advanced-ex-9-2';
UPDATE exercises SET xp_reward = 150 WHERE id = 'advanced-ex-9-3';
UPDATE exercises SET xp_reward = 120 WHERE id = 'advanced-ex-10-1';
UPDATE exercises SET xp_reward = 100 WHERE id = 'advanced-ex-10-2';
UPDATE exercises SET xp_reward = 150 WHERE id = 'advanced-ex-10-3';
UPDATE exercises SET xp_reward = 120 WHERE id = 'advanced-ex-11-1';
UPDATE exercises SET xp_reward = 150 WHERE id = 'advanced-ex-11-2';
UPDATE exercises SET xp_reward = 150 WHERE id = 'advanced-ex-11-3';
UPDATE exercises SET xp_reward = 100 WHERE id = 'advanced-ex-12-1';
UPDATE exercises SET xp_reward = 150 WHERE id = 'advanced-ex-12-2';
UPDATE exercises SET xp_reward = 150 WHERE id = 'advanced-ex-12-3';

## Projects
-- Beginner
UPDATE projects SET xp_reward = 150 WHERE id = 'beginner-project-1';
UPDATE projects SET xp_reward = 150 WHERE id = 'beginner-project-2';
UPDATE projects SET xp_reward = 150 WHERE id = 'beginner-project-3';
UPDATE projects SET xp_reward = 200 WHERE id = 'beginner-project-4';

-- Learner
UPDATE projects SET xp_reward = 200 WHERE id = 'learner-project-5';
UPDATE projects SET xp_reward = 200 WHERE id = 'learner-project-6';
UPDATE projects SET xp_reward = 200 WHERE id = 'learner-project-7';
UPDATE projects SET xp_reward = 200 WHERE id = 'learner-project-8';

-- Advanced
UPDATE projects SET xp_reward = 250 WHERE id = 'advanced-project-9';
UPDATE projects SET xp_reward = 300 WHERE id = 'advanced-project-10';
UPDATE projects SET xp_reward = 300 WHERE id = 'advanced-project-11';
UPDATE projects SET xp_reward = 300 WHERE id = 'advanced-project-12';

---


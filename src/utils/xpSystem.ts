// XP System - Centralized point calculation and tracking

export interface XPReward {
  amount: number;
  title: string;
  type: 'lesson' | 'exercise' | 'project' | 'module' | 'assessment' | 'levelup' | 'bonus';
}

export class XPSystem {
  // Base XP values
  static readonly LESSON_XP = 50;
  static readonly EXERCISE_XP = 100;
  static readonly PROJECT_XP = 200;
  static readonly MODULE_XP = 150;
  static readonly ASSESSMENT_XP = 300;
  static readonly LEVELUP_XP = 500;

  // Calculate total user points from progress
  // SUPABASE TODO: Query from progress/activity tables
  static calculateTotalPoints(_userId: string): number {
    try {
      if (typeof window === 'undefined') return 0;

      // DISABLED FOR SUPABASE MIGRATION - Returns 0
      // const progressKey = 'study_buddy_progress';
      // const data = localStorage.getItem(progressKey);
      // if (!data) return 0;

      // const allProgress = JSON.parse(data);
      // const userProgress = allProgress[userId];

      // if (!userProgress) return 0;

      // let totalPoints = 0;

      // // Points from daily activity (if available)
      // if (userProgress.dailyActivity) {
      //   const allActivity = Object.values(userProgress.dailyActivity) as any[];
      //   totalPoints += allActivity.reduce((sum, day) => {
      //     const xp = day.totalXP || 0;
      //     return sum + (isFinite(xp) ? xp : 0);
      //   }, 0);
      // }

      // // Fallback: Calculate from module progress if no daily activity
      // if (totalPoints === 0 && userProgress.moduleProgress) {
      //   const moduleProgress = userProgress.moduleProgress;

      //   Object.keys(moduleProgress).forEach(moduleId => {
      //     const progress = moduleProgress[moduleId];

      //     if (typeof progress === 'object') {
      //       // Detailed progress
      //       const lessonCount = progress.completedLessons?.length || 0;
      //       const exerciseCount = progress.completedExercises?.length || 0;
      //       const projectCount = progress.projectCompleted ? 1 : 0;

      //       totalPoints += lessonCount * this.LESSON_XP;
      //       totalPoints += exerciseCount * this.EXERCISE_XP;
      //       totalPoints += projectCount * this.PROJECT_XP;
      //     } else if (typeof progress === 'number' && progress === 100) {
      //       // Simple progress - completed module
      //       totalPoints += this.MODULE_XP;
      //     }
      //   });
      // }

      // // Bonus points for completed modules
      // const completedModules = userProgress.completedModules?.length || 0;
      // totalPoints += completedModules * this.MODULE_XP;

      // // Ensure valid number
      // return isFinite(totalPoints) ? totalPoints : 0;

      return 0;
    } catch (error) {
      console.error('Error calculating total points:', error);
      return 0;
    }
  }

  // Get reward for completing a lesson
  static getLessonReward(lessonTitle: string): XPReward {
    return {
      amount: this.LESSON_XP,
      title: `Completed: ${lessonTitle}`,
      type: 'lesson'
    };
  }

  // Get reward for completing an exercise
  static getExerciseReward(exerciseTitle: string): XPReward {
    return {
      amount: this.EXERCISE_XP,
      title: `Exercise Mastered: ${exerciseTitle}`,
      type: 'exercise'
    };
  }

  // Get reward for completing a project
  static getProjectReward(projectTitle: string): XPReward {
    return {
      amount: this.PROJECT_XP,
      title: `Project Completed: ${projectTitle}`,
      type: 'project'
    };
  }

  // Get reward for completing a module
  static getModuleReward(moduleTitle: string): XPReward {
    return {
      amount: this.MODULE_XP,
      title: `Module Mastered: ${moduleTitle}`,
      type: 'module'
    };
  }

  // Get reward for completing an assessment
  static getAssessmentReward(score: number): XPReward {
    // Ensure valid score
    const validScore = isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;
    const bonusMultiplier = validScore >= 90 ? 1.5 : validScore >= 80 ? 1.2 : 1;
    const amount = Math.floor(this.ASSESSMENT_XP * bonusMultiplier);

    return {
      amount: isFinite(amount) ? amount : this.ASSESSMENT_XP,
      title: `Assessment Passed with ${Math.round(validScore)}%!`,
      type: 'assessment'
    };
  }

  // Get reward for leveling up
  static getLevelUpReward(newLevel: string): XPReward {
    return {
      amount: this.LEVELUP_XP,
      title: `Level Up! You're now ${newLevel}!`,
      type: 'levelup'
    };
  }

  // Get bonus reward
  static getBonusReward(title: string, amount: number): XPReward {
    return {
      amount,
      title,
      type: 'bonus'
    };
  }

  // Save XP reward to user's progress
  static recordXP(userId: string, reward: XPReward): void {
    try {
      // This is already handled by ProgressManager.recordActivity
      // but we can add additional tracking here if needed
      // XP recorded (no debug logging)
    } catch (error) {
      console.error('Error recording XP:', error);
    }
  }

  // Compatibility shim: load XP data for a user (localStorage-backed when available)
  static loadXP(userId: string): { xp: number; level: number; badges: any[]; nextLevelXP: number } {
    try {
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(`xp_${userId}`);
          if (raw) return JSON.parse(raw);
        } catch (_) { /* ignore */ }
      }
      return { xp: 0, level: 1, badges: [], nextLevelXP: this.calculateNextLevelXP(1) };
    } catch (error) {
      console.error('XPSystem.loadXP error:', error);
      return { xp: 0, level: 1, badges: [], nextLevelXP: this.calculateNextLevelXP(1) };
    }
  }

  // Compatibility shim: save XP payload for a user
  static saveXP(userId: string, payload: any): void {
    try {
      if (typeof window !== 'undefined') {
        try { localStorage.setItem(`xp_${userId}`, JSON.stringify(payload)); } catch (_) { }
      }
    } catch (error) {
      console.error('XPSystem.saveXP error:', error);
    }
  }

  // Compatibility shim: calculate next level XP requirement
  static calculateNextLevelXP(level: number): number {
    try {
      const lv = Math.max(1, Number(level) || 1);
      return lv * this.LEVELUP_XP;
    } catch (error) {
      return this.LEVELUP_XP;
    }
  }
}

export default XPSystem;
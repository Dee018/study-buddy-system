/**
 * Comprehensive Java Programming Beginner Track Curriculum
 * Self-Paced Online Learning Module Using NetBeans IDE
 * 
 * This curriculum integrates detailed theoretical content, hands-on exercises,
 * and assessment projects for the 4-module beginner track
 */

// Import existing module structures
import { module1, module2, DetailedModule, DetailedLesson, Exercise, Project } from './javaBeginnerCurriculum';
import { module3, module4 } from './javaBeginnerCurriculumPart2';
import { module5, module6 } from './javaLearnerCurriculumPart1';
import { module7, module8 } from './javaLearnerCurriculumPart2';

/**
 * Complete Beginner Track - Modules 1-4
 * Each module represents approximately one week of study
 */
export const comprehensiveBeginnerTrack: DetailedModule[] = [
  module1, // Week 1: Foundation Building - Introduction to Java
  module2, // Week 2: Control Flow Mastery - Operators and Decision Making
  module3  // Week 3: Method Mastery - Modular Programming
];

/**
 * Complete Learner Track - Modules 5-8
 * Advanced OOP and File Handling
 */
export const comprehensiveLearnerTrack: DetailedModule[] = [
  module4, // Week 4: Data Structure Foundations - Arrays and String Manipulation (moved to learner track)
  module5, // Week 5: Object-Oriented Programming - Classes and Objects
  module6  // Week 6: Inheritance and Polymorphism
];

/**
 * All modules combined (Beginner + Learner)
 */
export const allModules: DetailedModule[] = [
  ...comprehensiveBeginnerTrack,
  ...comprehensiveLearnerTrack,
  module7, // Advanced Track start (module 7)
  module8  // Advanced Track (module 8)
];

/**
 * Get all exercises from the beginner track
 */
export function getAllBeginnerExercises(): Exercise[] {
  return comprehensiveBeginnerTrack.flatMap(module => module.handsOnExercises || []);
}

/**
 * Get all assessment projects from the beginner track
 */
export function getAllBeginnerProjects(): Project[] {
  return comprehensiveBeginnerTrack
    .map(module => module.assessmentProject)
    .filter(project => project !== undefined);
}

/**
 * Get exercises by module ID
 */
export function getExercisesByModule(moduleId: string): Exercise[] {
  const module = comprehensiveBeginnerTrack.find(m => m.id === moduleId);
  return module?.handsOnExercises || [];
}

/**
 * Get project by module ID
 */
export function getProjectByModule(moduleId: string): Project | undefined {
  const module = comprehensiveBeginnerTrack.find(m => m.id === moduleId);
  return module?.assessmentProject;
}

/**
 * Get module by week number
 */
export function getModuleByWeek(week: number): DetailedModule | undefined {
  return comprehensiveBeginnerTrack.find(m => m.week === week);
}

/**
 * Get module progress requirements
 */
export function getModuleRequirements(moduleId: string) {
  const module = comprehensiveBeginnerTrack.find(m => m.id === moduleId);
  if (!module) return null;

  return {
    lessonsCount: module.lessons.length,
    exercisesCount: module.handsOnExercises?.length || 0,
    hasProject: !!module.assessmentProject,
    estimatedHours: module.estimatedHours,
    objectives: module.objectives
  };
}

/**
 * Calculate overall progress in beginner track
 */
export function calculateBeginnerTrackProgress(completedModules: string[]): number {
  const totalModules = comprehensiveBeginnerTrack.length;
  const completedCount = completedModules.filter(id =>
    comprehensiveBeginnerTrack.some(m => m.id === id)
  ).length;

  return (completedCount / totalModules) * 100;
}

/**
 * Calculate overall progress in learner track
 */
export function calculateLearnerTrackProgress(completedModules: string[]): number {
  const totalModules = comprehensiveLearnerTrack.length;
  const completedCount = completedModules.filter(id =>
    comprehensiveLearnerTrack.some(m => m.id === id)
  ).length;

  return (completedCount / totalModules) * 100;
}

/**
 * Calculate overall progress across all modules
 */
export function calculateOverallProgress(completedModules: string[]): number {
  const totalModules = allModules.length;
  const completedCount = completedModules.filter(id =>
    allModules.some(m => m.id === id)
  ).length;

  return (completedCount / totalModules) * 100;
}

/**
 * Check if user can access a specific module based on prerequisites
 */
export function canAccessModule(moduleWeek: number, completedModules: string[]): boolean {
  if (moduleWeek === 1) return true; // First module is always accessible

  // Check if previous module is completed
  const previousModule = comprehensiveBeginnerTrack.find(m => m.week === moduleWeek - 1);
  if (!previousModule) return false;

  return completedModules.includes(previousModule.id);
}

/**
 * Get next recommended module for the user
 */
export function getNextRecommendedModule(completedModules: string[]): DetailedModule | null {
  for (const module of comprehensiveBeginnerTrack) {
    if (!completedModules.includes(module.id)) {
      // Check if prerequisites are met
      if (canAccessModule(module.week, completedModules)) {
        return module;
      }
    }
  }
  return null;
}

/**
 * Get module statistics
 */
export function getBeginnerTrackStats() {
  return {
    totalModules: comprehensiveBeginnerTrack.length,
    totalLessons: comprehensiveBeginnerTrack.reduce((sum, m) => sum + m.lessons.length, 0),
    totalExercises: comprehensiveBeginnerTrack.reduce((sum, m) => sum + (m.handsOnExercises?.length || 0), 0),
    totalProjects: comprehensiveBeginnerTrack.filter(m => m.assessmentProject).length,
    estimatedTotalHours: comprehensiveBeginnerTrack.reduce((sum, m) => sum + m.estimatedHours, 0)
  };
}

/**
 * Get module from all tracks by ID
 */
export function getModuleById(moduleId: string): DetailedModule | undefined {
  return allModules.find(m => m.id === moduleId);
}

/**
 * Get all modules by category
 */
export function getModulesByCategory(category: 'Beginner' | 'Learner' | 'Advanced'): DetailedModule[] {
  return allModules.filter(m => m.category === category);
}

/**
 * Export individual modules for backward compatibility
 */
export { module1, module2, module3, module4, module5, module6, module7, module8 };

/**
 * Export types for use in other components
 */
export type { DetailedModule, DetailedLesson, Exercise, Project };
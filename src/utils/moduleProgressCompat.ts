import { ModuleDetailedProgress } from '../data/javaCurriculum';

export function asDetailedModuleProgress(raw: any): ModuleDetailedProgress {
  if (raw && typeof raw === 'object') return raw as ModuleDetailedProgress;
  return { completedLessons: [], completedExercises: [], projectCompleted: false };
}

export function isDetailedModuleProgress(raw: any): raw is ModuleDetailedProgress {
  return !!raw && typeof raw === 'object';
}

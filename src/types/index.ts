export interface User {
  id: string;
  username: string;
  level: 'Beginner' | 'Learner' | 'Expert';
  points: number;
  badges: Badge[];
  createdAt: Date;
  progressData: ProgressData;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: 'completion' | 'streak' | 'mastery' | 'special';
}

export interface ProgressData {
  totalLessonsCompleted: number;
  totalAssessmentsCompleted: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  topicScores: { [topic: string]: number };
  weeklyProgress: { week: string; score: number }[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Intermediate' | 'Expert';
  lessons: Lesson[];
  isUnlocked: boolean;
  completionRate: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  codeExamples: CodeExample[];
  interactiveElements: InteractiveElement[];
  isCompleted: boolean;
  points: number;
}

export interface CodeExample {
  id: string;
  title: string;
  code: string;
  explanation: string;
  language: string;
}

export interface InteractiveElement {
  id: string;
  type: 'quiz' | 'coding' | 'drag-drop';
  question: string;
  options?: string[];
  correctAnswer: string;
  feedback: string;
}

export interface Assessment {
  id: string;
  moduleId: string;
  title: string;
  questions: Question[];
  timeLimit?: number;
  passingScore: number;
  maxAttempts: number;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'coding' | 'fill-blank' | 'true-false';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
  topic: string;
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  userId: string;
  score: number;
  totalPoints: number;
  answers: UserAnswer[];
  completedAt: Date;
  timeTaken: number;
  passed: boolean;
}

export interface UserAnswer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  completionRates: { [moduleId: string]: number };
  averageScores: { [moduleId: string]: number };
  commonDifficulties: { topic: string; errorRate: number }[];
}
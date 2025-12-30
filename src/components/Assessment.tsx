import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Input } from './ui/input';
import { Question, UserAnswer } from '../types';
import { StudyBuddyLogo } from './StudyBuddyLogo';
import { ProgressManager } from '../utils/progressManager';
import { ProgressSyncManager } from '../utils/progressSyncManager';
import { javaCurriculum } from '../data/javaCurriculum';
import { getCopyPastePreventionProps } from '../utils/preventCopyPaste';
import { handleTabKey } from '../utils/codeEditorUtils';
import { XPPopup } from './XPPopup';
import {
  Clock,
  Brain,
  Trophy,
  Star,
  Zap,
  AlertTriangle,
  Code,
  Target,
  TrendingUp,
  Home,
  Shield,
  ArrowRight,

  FileText,
  Lock,
  BookOpen
} from 'lucide-react';

// Assessment questions - no longer using mock data
const assessmentQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    difficulty: 'Easy',
    question: 'Which of the following is the correct way to declare a variable in Java?',
    options: ['int x = 5;', 'var x = 5;', 'x = 5;', 'integer x = 5;'],
    correctAnswer: 'int x = 5;',
    explanation: 'In Java, variables must be declared with their data type. "int x = 5;" is the correct syntax.',
    points: 10,
    topic: 'Variables'
  },
  {
    id: 'q2',
    type: 'coding',
    difficulty: 'Medium',
    question: 'Write a Java method that returns the sum of two integers.',
    options: [],
    correctAnswer: 'public static int sum(int a, int b) {\n    return a + b;\n}',
    explanation: 'This method takes two integer parameters and returns their sum.',
    points: 10,
    topic: 'Methods'
  },
  {
    id: 'q3',
    type: 'true-false',
    difficulty: 'Easy',
    question: 'Java is a case-sensitive programming language.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'Java is indeed case-sensitive, meaning "Variable" and "variable" are different identifiers.',
    points: 10,
    topic: 'Java Basics'
  },
  {
    id: 'q4',
    type: 'multiple-choice',
    difficulty: 'Hard',
    question: 'Which of the following demonstrates proper encapsulation in Java?',
    options: [
      'public int value;',
      'private int value; public int getValue() { return value; }',
      'protected int value;',
      'int value;'
    ],
    correctAnswer: 'private int value; public int getValue() { return value; }',
    explanation: 'Encapsulation involves making fields private and providing public getter/setter methods.',
    points: 10,
    topic: 'OOP'
  },
  {
    id: 'q5',
    type: 'multiple-choice',
    difficulty: 'Medium',
    question: 'What is the default value of a boolean variable in Java?',
    options: ['true', 'false', '0', 'null'],
    correctAnswer: 'false',
    explanation: 'The default value of a boolean in Java is false.',
    points: 10,
    topic: 'Data Types'
  },
  {
    id: 'q6',
    type: 'multiple-choice',
    difficulty: 'Easy',
    question: 'Which keyword is used to create a subclass in Java?',
    options: ['extends', 'implements', 'inherits', 'derived'],
    correctAnswer: 'extends',
    explanation: 'The "extends" keyword is used to create a subclass that inherits from a parent class.',
    points: 10,
    topic: 'Inheritance'
  },
  {
    id: 'q7',
    type: 'true-false',
    difficulty: 'Easy',
    question: 'In Java, arrays have a fixed size once created.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'Arrays in Java have a fixed size that cannot be changed after creation.',
    points: 10,
    topic: 'Arrays'
  },
  {
    id: 'q8',
    type: 'multiple-choice',
    difficulty: 'Medium',
    question: 'Which of these is NOT a valid access modifier in Java?',
    options: ['public', 'private', 'protected', 'package'],
    correctAnswer: 'package',
    explanation: 'The valid access modifiers are public, private, and protected. "package" is not an access modifier (default/package-private has no keyword).',
    points: 10,
    topic: 'Access Modifiers'
  },
  {
    id: 'q9',
    type: 'multiple-choice',
    difficulty: 'Hard',
    question: 'What will be the output of: System.out.println(10 + 20 + "30");',
    options: ['102030', '3030', '60', 'Error'],
    correctAnswer: '3030',
    explanation: 'The addition is performed left to right. 10 + 20 = 30, then 30 + "30" = "3030" (string concatenation).',
    points: 10,
    topic: 'Operators'
  },
  {
    id: 'q10',
    type: 'multiple-choice',
    difficulty: 'Medium',
    question: 'Which loop is guaranteed to execute at least once?',
    options: ['for loop', 'while loop', 'do-while loop', 'enhanced for loop'],
    correctAnswer: 'do-while loop',
    explanation: 'The do-while loop checks the condition after executing the body, guaranteeing at least one execution.',
    points: 10,
    topic: 'Control Flow'
  }
];

// Build cumulative question pools from the base question bank.
// We clone the base questions for learner/advanced pools so the
// assessment can grow to 2x/3x size without creating separate
// assessment components. Cloning keeps ids unique.
const cloneQuestions = (source: Question[], suffix: string) =>
  source.map(q => ({ ...q, id: `${q.id}-${suffix}` }));

const beginnerQuestions: Question[] = assessmentQuestions.slice();
const learnerAssessmentQuestions: Question[] = [
  {
    id: 'q11',
    type: 'multiple-choice',
    difficulty: 'Easy',
    question: 'What is the index of the first element in a Java array?',
    options: ['0', '1', '-1', 'Depends on size'],
    correctAnswer: '0',
    explanation: 'Java arrays are zero-indexed.',
    points: 10,
    topic: 'Arrays'
  },
  {
    id: 'q12',
    type: 'true-false',
    difficulty: 'Easy',
    question: 'Strings in Java are immutable.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'Once created, a String object cannot be changed.',
    points: 10,
    topic: 'Strings'
  },
  {
    id: 'q13',
    type: 'multiple-choice',
    difficulty: 'Medium',
    question: 'Which keyword is used to create an object in Java?',
    options: ['class', 'new', 'this', 'object'],
    correctAnswer: 'new',
    explanation: 'The new keyword allocates memory and creates an object.',
    points: 10,
    topic: 'Objects'
  },
  {
    id: 'q14',
    type: 'multiple-choice',
    difficulty: 'Medium',
    question: 'Which of the following defines a constructor?',
    options: [
      'It has a return type',
      'It has the same name as the class',
      'It is static',
      'It must be public'
    ],
    correctAnswer: 'It has the same name as the class',
    explanation: 'Constructors must match the class name exactly.',
    points: 10,
    topic: 'Constructors'
  },
  {
    id: 'q15',
    type: 'true-false',
    difficulty: 'Medium',
    question: 'A class can inherit from multiple classes in Java.',
    options: ['True', 'False'],
    correctAnswer: 'False',
    explanation: 'Java does not support multiple inheritance using classes.',
    points: 10,
    topic: 'Inheritance'
  },
  {
    id: 'q16',
    type: 'multiple-choice',
    difficulty: 'Hard',
    question: 'What is method overriding?',
    options: [
      'Using multiple methods with the same name in one class',
      'Providing a new implementation of a superclass method',
      'Calling a parent method',
      'Changing method parameters'
    ],
    correctAnswer: 'Providing a new implementation of a superclass method',
    explanation: 'Overriding allows subclasses to define their own behavior.',
    points: 10,
    topic: 'Polymorphism'
  },
  {
    id: 'q17',
    type: 'multiple-choice',
    difficulty: 'Medium',
    question: 'Which keyword refers to the current object?',
    options: ['super', 'this', 'self', 'current'],
    correctAnswer: 'this',
    explanation: 'this refers to the current object instance.',
    points: 10,
    topic: 'OOP Basics'
  },
  {
    id: 'q18',
    type: 'multiple-choice',
    difficulty: 'Medium',
    question: 'Which access modifier makes a member visible only within the same package?',
    options: ['public', 'private', 'protected', 'default'],
    correctAnswer: 'default',
    explanation: 'Default (no keyword) allows package-level access.',
    points: 10,
    topic: 'Access Control'
  },
  {
    id: 'q19',
    type: 'true-false',
    difficulty: 'Easy',
    question: 'An object is an instance of a class.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'Objects are created from classes.',
    points: 10,
    topic: 'OOP Basics'
  },
  {
    id: 'q20',
    type: 'multiple-choice',
    difficulty: 'Hard',
    question: 'Which concept allows the same method name to behave differently?',
    options: ['Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction'],
    correctAnswer: 'Polymorphism',
    explanation: 'Polymorphism enables dynamic method behavior.',
    points: 10,
    topic: 'Polymorphism'
  }
];
const advancedAssessmentQuestions: Question[] = [
  {
    id: 'q21',
    type: 'multiple-choice',
    difficulty: 'Medium',
    question: 'Which keyword is used to implement an interface?',
    options: ['extends', 'implements', 'inherits', 'interface'],
    correctAnswer: 'implements',
    explanation: 'Classes implement interfaces using the implements keyword.',
    points: 10,
    topic: 'Interfaces'
  },
  {
    id: 'q22',
    type: 'true-false',
    difficulty: 'Medium',
    question: 'An abstract class can have implemented methods.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'Abstract classes can contain both abstract and concrete methods.',
    points: 10,
    topic: 'Abstract Classes'
  },
  {
    id: 'q23',
    type: 'multiple-choice',
    difficulty: 'Hard',
    question: 'Which of the following cannot be instantiated?',
    options: ['Concrete class', 'Interface', 'Object', 'Method'],
    correctAnswer: 'Interface',
    explanation: 'Interfaces cannot be instantiated directly.',
    points: 10,
    topic: 'Interfaces'
  },
  {
    id: 'q24',
    type: 'multiple-choice',
    difficulty: 'Medium',
    question: 'Which keyword is used to handle exceptions?',
    options: ['throw', 'throws', 'try-catch', 'error'],
    correctAnswer: 'try-catch',
    explanation: 'Exceptions are handled using try-catch blocks.',
    points: 10,
    topic: 'Exception Handling'
  },
  {
    id: 'q25',
    type: 'true-false',
    difficulty: 'Easy',
    question: 'Checked exceptions must be handled or declared.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'Checked exceptions are enforced at compile time.',
    points: 10,
    topic: 'Exceptions'
  },
  {
    id: 'q26',
    type: 'multiple-choice',
    difficulty: 'Hard',
    question: 'Which class is commonly used to read text files?',
    options: ['Scanner', 'ArrayList', 'System', 'Math'],
    correctAnswer: 'Scanner',
    explanation: 'Scanner can read input from files.',
    points: 10,
    topic: 'File I/O'
  },
  {
    id: 'q27',
    type: 'multiple-choice',
    difficulty: 'Medium',
    question: 'Which statement throws an exception manually?',
    options: ['throws', 'catch', 'throw', 'try'],
    correctAnswer: 'throw',
    explanation: 'The throw keyword explicitly throws an exception.',
    points: 10,
    topic: 'Exceptions'
  },
  {
    id: 'q28',
    type: 'true-false',
    difficulty: 'Medium',
    question: 'Finally blocks always execute whether an exception occurs or not.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'finally blocks execute regardless of exception handling.',
    points: 10,
    topic: 'Exception Handling'
  },
  {
    id: 'q29',
    type: 'multiple-choice',
    difficulty: 'Hard',
    question: 'Which interface must be implemented for custom sorting?',
    options: ['Serializable', 'Runnable', 'Comparable', 'Cloneable'],
    correctAnswer: 'Comparable',
    explanation: 'Comparable allows objects to be compared.',
    points: 10,
    topic: 'Interfaces'
  },
  {
    id: 'q30',
    type: 'multiple-choice',
    difficulty: 'Medium',
    question: 'Which class is used to write text to a file?',
    options: ['Scanner', 'FileWriter', 'FileReader', 'BufferedReader'],
    correctAnswer: 'FileWriter',
    explanation: 'FileWriter is used for writing character files.',
    points: 10,
    topic: 'File I/O'
  }
];

interface AssessmentProps {
  onNavigate: (screen: string, data?: any) => void;
  onComplete: (result: any) => void;
  onStart: () => void;
  onExit: () => void;
  userLevel: string;
  userId?: string;
  onXPEarned?: (points: number, title: string) => void;
  onPointsRefresh?: () => void;
  data?: any;
}

export function Assessment({ onNavigate, onStart, onExit, userLevel, userId, onXPEarned: _onXPEarned, onPointsRefresh: _onPointsRefresh, onComplete: _onComplete }: AssessmentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20 minutes = 1200 seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [canAccessAssessment, setCanAccessAssessment] = useState(false);
  const [completedModulesCount, setCompletedModulesCount] = useState(0);
  const [requiredModulesCount, setRequiredModulesCount] = useState(4);
  const [progressHydrationTick, setProgressHydrationTick] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [showXPPopup, setShowXPPopup] = useState(false);
  const [xpPopupKey, setXpPopupKey] = useState<string | undefined>(undefined);
  const [assessmentAttemptId, setAssessmentAttemptId] = useState<string | null>(null);
  const [questionsPool, setQuestionsPool] = useState<Question[]>([]);

  // Build cumulative question pool based on server-authoritative completed modules
  const levelBasedQuestions = React.useMemo(() => {
    try {
      if (!userId) return beginnerQuestions.slice();

      // Helper to find module id by numeric suffix or week
      const findModuleIdByNumber = (n: number) => {
        const byId = javaCurriculum.find(m => {
          try {
            if (!m?.id) return false;
            // match numeric suffix at end of id
            return new RegExp(`${n}$`).test(m.id) || m.week === n;
          } catch (e) {
            return false;
          }
        });
        return byId?.id;
      };

      const requiredSets = {
        beginner: [1, 2, 3].map(findModuleIdByNumber).filter(Boolean) as string[],
        learner: [4, 5, 6].map(findModuleIdByNumber).filter(Boolean) as string[],
        advanced: [7, 8].map(findModuleIdByNumber).filter(Boolean) as string[]
      };

      // Determine completion of a set by using ProgressManager.isModuleCompleted
      const allCompleted = (ids: string[]) => ids.length > 0 && ids.every(id => ProgressManager.isModuleCompleted(userId, id));

      // Determine highest unlocked track
      let unlocked: 'BEGINNER' | 'LEARNER' | 'ADVANCED' = 'BEGINNER';
      if (allCompleted(requiredSets.advanced)) unlocked = 'ADVANCED';
      else if (allCompleted(requiredSets.learner)) unlocked = 'LEARNER';

      // Build cumulative pool
      let pool: Question[] = [];
      pool = pool.concat(beginnerQuestions);
      if (unlocked === 'LEARNER' || unlocked === 'ADVANCED') pool = pool.concat(learnerAssessmentQuestions);
      if (unlocked === 'ADVANCED') pool = pool.concat(advancedAssessmentQuestions);

      return pool;
    } catch (err) {
      return beginnerQuestions.slice();
    }
  }, [userId, progressHydrationTick]);

  const currentQuestion = questionsPool[currentQuestionIndex] || levelBasedQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / Math.max(1, questionsPool.length || levelBasedQuestions.length)) * 100;

  const calculateResults = useCallback(() => {
    // Dynamic scoring: 10 points per question
    const pointsPerQuestion = 10;
    const questionCount = Math.max(1, questionsPool.length || levelBasedQuestions.length);
    const totalPoints = questionCount * pointsPerQuestion;
    const earnedPoints = answers.reduce((sum, answer) => {
      return sum + (answer.isCorrect ? pointsPerQuestion : 0);
    }, 0);

    const percentage = Math.round((earnedPoints / totalPoints) * 100);
    const passed = percentage >= 70; // 70% passing score

    // Calculate topic breakdown using the questions from this attempt (questionsPool fallback to levelBasedQuestions)
    const currentQuestionSet = questionsPool.length ? questionsPool : levelBasedQuestions;
    const topicBreakdown: { [topic: string]: { correct: number; total: number } } = {};
    answers.forEach(answer => {
      const question = currentQuestionSet.find(q => q.id === answer.questionId);
      if (question) {
        if (!topicBreakdown[question.topic]) {
          topicBreakdown[question.topic] = { correct: 0, total: 0 };
        }
        topicBreakdown[question.topic].total++;
        if (answer.isCorrect) {
          topicBreakdown[question.topic].correct++;
        }
      }
    });

    const weakAreas = Object.entries(topicBreakdown)
      .filter(([, stats]) => {
        // Prevent division by zero
        if (stats.total === 0) return false;
        const ratio = stats.correct / stats.total;
        return isFinite(ratio) && ratio < 0.7;
      })
      .map(([topic]) => topic);

    return {
      score: percentage,
      earnedPoints,
      totalPoints,
      passed,
      correctAnswers: answers.filter(a => a.isCorrect).length,
      totalQuestions: questionCount,
      timeTaken: 1200 - timeRemaining,
      topicBreakdown,
      weakAreas,
      newLevel: passed ? (percentage >= 90 ? 'Advanced' : 'Learner') : userLevel
    };
  }, [answers, timeRemaining, userLevel, levelBasedQuestions, questionsPool]);

  const handleSubmitAssessment = useCallback(() => {
    // Save final answer if on last question
    if (currentAnswer && currentQuestion && !answers.find(a => a.questionId === currentQuestion.id)) {
      const finalAnswer: UserAnswer = {
        questionId: currentQuestion.id,
        answer: currentAnswer,
        isCorrect: currentAnswer === currentQuestion.correctAnswer,
        timeSpent: 60
      };
      setAnswers(prev => [...prev, finalAnswer]);
    }

    setIsSubmitted(true);
    const result = calculateResults();
    setAssessmentResult(result);
    onExit(); // Unlock navigation after assessment

    // Record assessment in ProgressManager
    if (userId) {
      const topicScores: { [topic: string]: number } = {};
      Object.entries(result.topicBreakdown).forEach(([topic, stats]: [string, any]) => {
        // Prevent division by zero
        if (stats.total > 0) {
          const score = (stats.correct / stats.total) * 100;
          topicScores[topic] = isFinite(score) ? Math.round(score) : 0;
        } else {
          topicScores[topic] = 0;
        }
      });

      const studyTimeMinutes = Math.round((1200 - timeRemaining) / 60);

      ProgressSyncManager.recordAssessment(
        userId,
        assessmentAttemptId || `assessment-${userLevel}-${Date.now()}`,
        'general-assessment',
        result.earnedPoints,
        result.totalPoints,
        topicScores,
        studyTimeMinutes
      );
    }

    // Show XP popup for completed assessment
    if (result.passed) {
      setEarnedXP(result.earnedPoints);
      setShowXPPopup(true);
      // Generate unique key to prevent duplicate displays across sessions
      const uniqueKey = userId ? `${userId}_assessment_${Date.now()}` : `assessment_${Date.now()}`;
      setXpPopupKey(uniqueKey);
      setTimeout(() => {
        setShowXPPopup(false);
        setShowResults(true);
      }, 3000);
    } else {
      setShowResults(true);
    }
  }, [currentAnswer, currentQuestion, answers, calculateResults, onExit, userId, userLevel, timeRemaining]);

  // Check module completion requirements
  useEffect(() => {
    if (!userId) {
      setCanAccessAssessment(false);
      return;
    }
    const userProgress = ProgressManager.loadProgress(userId);

    // Map numeric level values to descriptive names if necessary
    const getLevelName = (lvl: any) => {
      if (typeof lvl === 'string') return lvl;
      // Common numeric mapping: 1 -> Beginner, 2 -> Learner, 3 -> Advanced
      if (typeof lvl === 'number') {
        switch (lvl) {
          case 1:
            return 'Beginner';
          case 2:
            return 'Learner';
          case 3:
            return 'Advanced';
          default:
            return 'Beginner';
        }
      }
      return String(lvl || 'Beginner');
    };

    const levelName = getLevelName(userLevel);

    // Determine eligible modules based on normalized level
    const eligibleModules = javaCurriculum.filter(module => {
      if (levelName === 'Beginner') return module.category === 'Beginner';
      if (levelName === 'Learner') return module.category === 'Beginner' || module.category === 'Learner';
      return true;
    });

    // Count completed modules by querying ProgressManager.isModuleCompleted
    let completedCount = 0;
    for (const module of eligibleModules) {
      try {
        if (ProgressManager.isModuleCompleted(userId, module.id)) {
          completedCount += 1;
        }
      } catch (err) {
        // Defensive: ignore per-module errors
      }
    }

    setCompletedModulesCount(completedCount);

    const requiredCount = Math.min(4, eligibleModules.length);
    setRequiredModulesCount(requiredCount);

    setCanAccessAssessment(completedCount >= requiredCount);
  }, [userId, userLevel, progressHydrationTick]);

  // Re-check requirements when progress hydrates/updates from Supabase
  useEffect(() => {
    if (!userId) return;

    const handleProgressUpdate = (event: CustomEvent) => {
      if (event?.detail?.userId === userId) {
        setProgressHydrationTick((t) => t + 1);
      }
    };

    window.addEventListener('progressUpdated', handleProgressUpdate as EventListener);
    return () => window.removeEventListener('progressUpdated', handleProgressUpdate as EventListener);
  }, [userId]);

  // Prevent copy-paste functionality
  useEffect(() => {
    if (!showOnboarding && !showResults) {
      const preventCopyPaste = (e: Event) => {
        e.preventDefault();
        return false;
      };

      const preventKeyboardShortcuts = (e: KeyboardEvent) => {
        // Prevent Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, F12, etc.
        if (
          (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a')) ||
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.ctrlKey && e.key === 'u')
        ) {
          e.preventDefault();
          return false;
        }
      };

      document.addEventListener('copy', preventCopyPaste);
      document.addEventListener('paste', preventCopyPaste);
      document.addEventListener('cut', preventCopyPaste);
      document.addEventListener('keydown', preventKeyboardShortcuts);
      document.addEventListener('contextmenu', preventCopyPaste);

      return () => {
        document.removeEventListener('copy', preventCopyPaste);
        document.removeEventListener('paste', preventCopyPaste);
        document.removeEventListener('cut', preventCopyPaste);
        document.removeEventListener('keydown', preventKeyboardShortcuts);
        document.removeEventListener('contextmenu', preventCopyPaste);
      };
    }
  }, [showOnboarding, showResults]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitted && !showOnboarding) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !showOnboarding && !isSubmitted) {
      handleSubmitAssessment();
    }
  }, [timeRemaining, isSubmitted, showOnboarding, handleSubmitAssessment]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value);
  };

  const handleNextQuestion = () => {
    // Save current answer
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      answer: currentAnswer,
      isCorrect: currentAnswer === currentQuestion.correctAnswer,
      timeSpent: 60 // Mock time spent
    };

    const updatedAnswers = [...answers];
    const existingIndex = updatedAnswers.findIndex(a => a.questionId === currentQuestion.id);

    if (existingIndex >= 0) {
      updatedAnswers[existingIndex] = newAnswer;
    } else {
      updatedAnswers.push(newAnswer);
    }

    setAnswers(updatedAnswers);

    if (currentQuestionIndex < (questionsPool.length || levelBasedQuestions.length) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Load existing answer if user is going back
      const nextId = (questionsPool.length ? questionsPool[currentQuestionIndex + 1] : levelBasedQuestions[currentQuestionIndex + 1])?.id;
      const existingAnswer = updatedAnswers.find(a => a.questionId === nextId);
      setCurrentAnswer(existingAnswer?.answer || '');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      const prevId = (questionsPool.length ? questionsPool[currentQuestionIndex - 1] : levelBasedQuestions[currentQuestionIndex - 1])?.id;
      const existingAnswer = answers.find(a => a.questionId === prevId);
      setCurrentAnswer(existingAnswer?.answer || '');
    }
  };

  const handleRetakeAssessment = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setCurrentAnswer('');
    setTimeRemaining(1200);
    setIsSubmitted(false);
    setShowResults(false);
    setAssessmentResult(null);
    setShowOnboarding(true);
    // Reset questions pool so a fresh shuffle occurs on next start
    setQuestionsPool([]);
    onExit(); // Allow navigation again
  };

  const handleStartAssessment = () => {
    // Generate a stable assessment attempt id and record the attempt start server-side
    const attemptId = `assessment-${userLevel}-${Date.now()}`;
    setAssessmentAttemptId(attemptId);
    setShowOnboarding(false);
    // Best-effort: record attempt start (non-blocking)
    try {
      if (userId) ProgressSyncManager.beginAssessmentAttempt(userId, attemptId, 'general-assessment', levelBasedQuestions.length);
    } catch (e) { /* ignore */ }
    onStart(); // Lock navigation
  };

  // Shuffle helper (deterministic shuffle not required)
  const shuffleQuestions = (arr: Question[]) => {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // When assessment starts, create a shuffled pool from the cumulative questions
  useEffect(() => {
    if (!showOnboarding && questionsPool.length === 0) {
      setQuestionsPool(shuffleQuestions(levelBasedQuestions));
    }
  }, [showOnboarding, levelBasedQuestions, questionsPool.length]);

  // Show access restriction if user hasn't completed enough modules
  if (!canAccessAssessment) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <Card className="border-primary/20 mb-6">
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <div className="relative inline-block">
                  <StudyBuddyLogo size="3xl" variant="minimal" animate={true} withBackground={false} />
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-muted to-muted/80 rounded-full flex items-center justify-center shadow-lg">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl mb-2">Assessment Center</h1>
                  <p className="text-muted-foreground">Complete more modules to unlock assessments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access Restriction */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Lock className="w-10 h-10 text-primary" />
                </div>

                <div>
                  <h2 className="text-2xl mb-3">Assessment Locked</h2>
                  <p className="text-muted-foreground mb-4">
                    To ensure you're ready for assessment, please complete at least {requiredModulesCount} modules in your current learning track first.
                  </p>
                </div>

                <div className="bg-card/50 rounded-lg p-6 max-w-md mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Progress Requirement</span>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      {userLevel} Level
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Modules Completed</span>
                      <span className="font-medium">{completedModulesCount} / {requiredModulesCount}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (completedModulesCount / requiredModulesCount) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {requiredModulesCount - completedModulesCount} more modules needed
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => onNavigate('learning')}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Continue Learning
                  </Button>
                  <Button variant="outline" onClick={() => onNavigate('progress')}>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Progress
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          {/* Clean Header */}
          <Card className="border-primary/20 mb-6">
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <div className="relative inline-block">
                  <StudyBuddyLogo size="3xl" variant="minimal" animate={true} withBackground={false} />
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl mb-2">Assessment Center</h1>
                  <p className="text-muted-foreground">Test your Java programming knowledge</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>Assessment Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Questions</span>
                  <Badge variant="secondary">{levelBasedQuestions.length}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Time Limit</span>
                  <Badge variant="secondary">20 minutes</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Total Points</span>
                  <Badge variant="secondary">{Math.max(1, levelBasedQuestions.length) * 10} pts</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Passing Score</span>
                  <Badge variant="secondary">70%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span>Security Notice</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
                  <p className="text-sm text-primary dark:text-primary">
                    Copy-paste functionality will be disabled during the assessment to ensure academic integrity.
                  </p>
                </div>
                <div className="p-3 bg-accent/10 dark:bg-accent/20 rounded-lg">
                  <p className="text-sm text-accent dark:text-accent">
                    Session monitoring is active for security purposes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Start Assessment */}
          <Card className="border-primary/30">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Button
                  onClick={handleStartAssessment}
                  size="lg"
                  className="px-8 py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Begin Assessment
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <div className="flex justify-center">
                  <Button variant="outline" onClick={() => onNavigate('learning')}>
                    <Home className="w-4 h-4 mr-2" />
                    Return to Learning Hub
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showResults && assessmentResult) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${assessmentResult.passed ? 'bg-green-500/20' : 'bg-destructive/20'
              }`}>
              {assessmentResult.passed ? (
                <Trophy className="w-10 h-10 text-green-500" />
              ) : (
                <Target className="w-10 h-10 text-destructive" />
              )}
            </div>
            <h1 className="text-3xl mb-2">
              {assessmentResult.passed ? 'Congratulations!' : 'Keep Learning!'}
            </h1>
            <p className="text-muted-foreground">
              {assessmentResult.passed
                ? 'You have successfully completed the assessment!'
                : 'Don\'t worry, every expert was once a beginner.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Score Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-primary" />
                  <span>Your Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">{assessmentResult.score}%</div>
                  <Progress value={assessmentResult.score} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {assessmentResult.correctAnswers}/{assessmentResult.totalQuestions} questions correct
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl">{Math.floor(assessmentResult.timeTaken / 60)}</div>
                    <p className="text-sm text-muted-foreground">Minutes</p>
                  </div>
                  <div>
                    <div className="text-xl">+{assessmentResult.earnedPoints}</div>
                    <p className="text-sm text-muted-foreground">Points Earned</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Level Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span>Level Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge className="text-lg px-4 py-2 mb-4">
                    New Level: {assessmentResult.newLevel}
                  </Badge>
                  <div className="space-y-2">
                    <p className="text-sm">
                      {assessmentResult.passed
                        ? '🎉 You\'ve leveled up! More challenging content is now unlocked.'
                        : '📚 Keep practicing to reach the next level.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Topic Breakdown */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Topic Analysis</CardTitle>
              <CardDescription>
                See how you performed in different areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(assessmentResult.topicBreakdown).map(([topic, stats]: [string, any]) => {
                  const percentage = (stats as any).total > 0 ? Math.round(((stats as any).correct / (stats as any).total) * 100) : 0;
                  const isWeak = percentage < 70;

                  return (
                    <div key={topic} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          {isWeak && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                          <span>{topic}</span>
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {stats.correct}/{stats.total} ({percentage}%)
                        </span>
                      </div>
                      <Progress
                        value={percentage}
                        className={isWeak ? 'bg-destructive/20' : ''}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {assessmentResult.weakAreas.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <span>AI-Powered Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <h4 className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span>Areas for Improvement</span>
                    </h4>
                    <p className="text-sm mb-3">
                      Based on your performance, consider reviewing these topics:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {assessmentResult.weakAreas.map((area: string) => (
                        <Badge key={area} variant="outline" className="border-yellow-500/50">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => onNavigate('learning')}>
                    📖 Review Learning Materials
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="text-center space-y-4">
            <Button onClick={() => onNavigate('learning')} size="lg" className="px-8">
              <Home className="w-4 h-4 mr-2" />
              Back to Learning Hub
            </Button>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={handleRetakeAssessment}>
                <Zap className="w-4 h-4 mr-2" />
                Retake Assessment
              </Button>
              <Button variant="outline" onClick={() => onNavigate('progress')}>
                <Trophy className="w-4 h-4 mr-2" />
                View Progress
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Assessment Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl">Java Assessment - {userLevel} Level</h1>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questionsPool.length || levelBasedQuestions.length}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeRemaining)}</span>
            </Badge>
            <Badge variant="outline" className="border-red-500/50 text-red-500">
              <Shield className="w-4 h-4 mr-1" />
              Academic Integrity Mode
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Question Content - Cleaner Layout */}
        <div className="space-y-6">
          {/* Question */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${currentQuestion.difficulty === 'Easy' ? 'bg-green-500/20 text-green-500' :
                    currentQuestion.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                    {currentQuestion.difficulty[0]}
                  </div>
                  <span>Question {currentQuestionIndex + 1}</span>
                </CardTitle>
                <Badge variant="outline">
                  {currentQuestion.points} points
                </Badge>
              </div>
              <CardDescription>Topic: {currentQuestion.topic}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-lg leading-relaxed">
                {currentQuestion.question}
              </div>

              {/* Answer Input based on question type */}
              {currentQuestion.type === 'multiple-choice' && (
                <RadioGroup value={currentAnswer} onValueChange={handleAnswerChange}>
                  {currentQuestion.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <label htmlFor={`option-${index}`} className="cursor-pointer flex-1 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        {option}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === 'true-false' && (
                <RadioGroup value={currentAnswer} onValueChange={handleAnswerChange}>
                  {currentQuestion.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`tf-${index}`} />
                      <label htmlFor={`tf-${index}`} className="cursor-pointer flex-1 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        {option}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === 'coding' && (
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Code className="w-4 h-4" />
                    <span>Write your code below:</span>
                  </label>
                  <Textarea
                    placeholder="Type your Java code here..."
                    value={currentAnswer}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    onKeyDown={handleTabKey}
                    className="font-mono text-sm min-h-[150px]"
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    style={{
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none',
                      userSelect: 'none'
                    }}
                    {...getCopyPastePreventionProps()}
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Focus on correct syntax and logic. ⌨️ <strong>Full IDE keyboard support:</strong> Tab/Shift+Tab for indent/outdent, Ctrl+Z for undo, and all editing shortcuts work
                  </p>
                </div>
              )}

              {currentQuestion.type === 'fill-blank' && (
                <div className="space-y-2">
                  <label>Fill in the blank:</label>
                  <Input
                    placeholder="Your answer..."
                    value={currentAnswer}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Time remaining: {formatTime(timeRemaining)}</span>
            </div>

            {currentQuestionIndex === (questionsPool.length || levelBasedQuestions.length) - 1 ? (
              <Button
                onClick={handleSubmitAssessment}
                disabled={!currentAnswer}
                className="bg-green-600 hover:bg-green-700"
              >
                Submit Assessment
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                disabled={!currentAnswer}
              >
                Next
              </Button>
            )}
          </div>

          {/* Assessment Info Footer */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span>Total Questions: {questionsPool.length || levelBasedQuestions.length}</span>
                  <span>Passing Score: 70%</span>
                  <span>Total Points: {Math.max(1, questionsPool.length || levelBasedQuestions.length) * 10}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Secure Mode Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* XP Popup */}
      <XPPopup
        show={showXPPopup}
        points={earnedXP}
        title="Assessment Completed!"
        uniqueKey={xpPopupKey}
        onComplete={() => setShowXPPopup(false)}
      />
    </div>
  );
}
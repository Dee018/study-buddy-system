import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Alert, AlertDescription } from './ui/alert';
import { getCopyPastePreventionProps } from '../utils/preventCopyPaste';
import { handleTabKey } from '../utils/codeEditorUtils';
import { useAutoSave } from '../contexts/AutoSaveContext';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { usePreferences } from '../contexts/PreferencesContext';
import {
  Code,
  CheckCircle,
  Lightbulb,
  ArrowLeft,
  Target,
  Award,
  XCircle,
  AlertCircle,
  Sparkles,
  FileCheck,
  Eye,
  RefreshCw,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { simulateJavaCode } from '../utils/javaCodeSimulator';
import { asDetailedModuleProgress } from '../utils/moduleProgressCompat';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward?: number;
  starterCode?: string;
  solutionCode?: string;
  expectedOutput?: string;
  hints?: string[];
}

interface ExerciseViewerProps {
  exercise: Exercise;
  onBack: () => void;
  onComplete: (code: string, isCorrect: boolean) => void;
  moduleId?: string;
  progressIsLoading?: boolean;
  isRefreshingProgress?: boolean;
}

interface ValidationState {
  isCorrect: boolean;
  feedback: string;
  output: string;
}

export function ExerciseViewer({ exercise, onBack, onComplete, moduleId }: ExerciseViewerProps) {
  // pull flags if passed
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { progressIsLoading = false, isRefreshingProgress = false } = (arguments[0] || {} as any);
  const {
    saveStatus,
    lastSaved,
    enableAutoSave,
    loadSavedContent,
    forceSave,
  } = useAutoSave();
  const { user } = useAuth();

  const { completeExercise, moduleProgress } = useProgress();
  // Safely read module progress; provide stable defaults if missing
  const getNumericProgress = (mId: string) => {
    const raw = moduleProgress?.[mId] ?? moduleProgress?.[mId.replace('module-', 'beginner-module-')];
    const detailed = asDetailedModuleProgress(raw);
    const total_xp = Number((raw as any)?.total_xp ?? (raw as any)?.totalXP ?? (raw as any)?.xp ?? (detailed as any)?.total_xp ?? 0) || 0;
    const completedLessons = Array.isArray(detailed?.completedLessons)
      ? detailed.completedLessons
      : Array.isArray((raw as any)?.completed_lessons)
        ? (raw as any).completed_lessons
        : [];
    return { total_xp, completedLessons };
  };
  const { trackEvent } = useAnalytics();
  const { preferences } = usePreferences();

  const [userCode, setUserCode] = useState(exercise.starterCode || '');
  const [showHints, setShowHints] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  // previousCode/showPreviousCode removed — unused in current flow
  const [loading, setLoading] = useState(true);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);

  /**
   * Load saved content and check completion status on mount
   */
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);

      // Track exercise start
      trackEvent('exercise_start', 'Exercise Opened', {
        exercise_id: exercise.id,
        module_id: moduleId,
        difficulty: exercise.difficulty,
      });

      // Check if exercise is completed (moduleProgress may be legacy numeric or detailed object)
      const raw = moduleId ? (moduleProgress?.[moduleId] ?? moduleProgress?.[moduleId?.replace('module-', 'beginner-module-')]) : null;
      const detailed = asDetailedModuleProgress(raw);
      const completedArr = Array.isArray(detailed.completedExercises) ? detailed.completedExercises : Array.isArray((raw as any)?.exercises_completed) ? (raw as any).exercises_completed : [];
      const completed = !!(moduleId && completedArr.includes(exercise.id));
      setExerciseCompleted(completed);

      // SINGLE SOURCE OF TRUTH: if a valid session exists (tab-scoped or authenticated user),
      // do NOT attempt to load or restore autosaved content. Delete legacy local drafts
      // and start clean. This prevents restore prompts and loader retries.
      const hasSession = (typeof window !== 'undefined' && (sessionStorage.getItem('current_session_id') || sessionStorage.getItem('sb_analytics_session_id'))) || user?.id;

      // Only attempt to load saved content for anonymous users (legacy clients).
      const saved = !hasSession ? await loadSavedContent('exercise', exercise.id, moduleId || '') : null;

      if (hasSession) {
        try {
          if (typeof window !== 'undefined') {
            const possibleKeys = [
              `exerciseDraft_${exercise.id}`,
              `autosave_${exercise.id}`,
              `unsaved_work_${exercise.id}`,
              `study_buddy_autosave_${exercise.id}`,
              `sb_autosave_${exercise.id}`,
            ];
            for (const k of possibleKeys) {
              try { localStorage.removeItem(k); } catch { }
              try { sessionStorage.removeItem(k); } catch { }
            }
          }
        } catch (e) { /* ignore cleanup errors */ }

        // Do not prompt; always start with starter code for sessions
        setUserCode(exercise.starterCode || '');
      } else {
        if (saved && (saved as any).saved_code !== exercise.starterCode) {
          // Ask user if they want to restore
          const shouldRestore = window.confirm(
            'You have unsaved work from a previous session. Would you like to restore it?'
          );

          if (shouldRestore) {
            setUserCode((saved as any).saved_code);
            toast.info('Restored previous work');
          } else {
            setUserCode(exercise.starterCode || '');
          }
        } else {
          setUserCode(exercise.starterCode || '');
        }
      }

      setLoading(false);
    };
    loadContent();
  }, [exercise.id, moduleId, exercise.difficulty, exercise.starterCode, loadSavedContent, trackEvent, moduleProgress, user?.id]);

  /**
   * Enable auto-save when code changes
   */
  useEffect(() => {
    if (!loading && userCode) {
      const cleanup = enableAutoSave('exercise', exercise.id, userCode, 5000, moduleId || '');
      return cleanup;
    }
  }, [userCode, loading, exercise.id, enableAutoSave]);

  /**
   * Handle code change
   */
  const handleCodeChange = (newCode: string) => {
    setUserCode(newCode);

    // Track code execution events
    if (newCode.includes('System.out.println')) {
      trackEvent('code_run', 'Code Executed', {
        exercise_id: exercise.id,
        module_id: moduleId,
        code_length: newCode.length,
      });
    }
  };

  /**
   * Extract output from code
   */
  const extractOutputFromCode = (code: string): string => {
    const result = simulateJavaCode(code);
    return result.error ? `(Error: ${result.error})` : result.output;
  };

  /**
   * Validate solution
   * Priority: If a canonical `solutionCode` is provided for the exercise, validate by code comparison
   * otherwise fall back to the existing output-based validation.
   */
  const validateSolution = (code: string): ValidationState => {
    const trimmedCode = code.trim();

    // Check if code is empty
    if (!trimmedCode) {
      return {
        isCorrect: false,
        feedback: 'Please write some code before submitting.',
        output: '',
      };
    }

    // Check if code is just the starter code
    if (trimmedCode === (exercise.starterCode || '').trim()) {
      return {
        isCorrect: false,
        feedback: 'You need to modify the starter code to complete the exercise.',
        output: '',
      };
    }

    // If a canonical solution is present, compare normalized code strings
    if (exercise.solutionCode && exercise.solutionCode.trim().length > 0) {
      // Remove comments and normalize whitespace for tolerant comparison
      const removeComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      const normalizeCode = (s: string) => removeComments(s).replace(/\r\n/g, '\n').replace(/\s+$/gm, '').trim();
      const userNormalized = normalizeCode(trimmedCode);
      const canonicalNormalized = normalizeCode(exercise.solutionCode || '');

      // Also compare after removing all whitespace and comments to tolerate formatting and comment differences
      const stripWhitespace = (s: string) => removeComments(s).replace(/\s+/g, '');
      const userNoSpace = stripWhitespace(userNormalized).toLowerCase();
      const canonicalNoSpace = stripWhitespace(canonicalNormalized).toLowerCase();

      if (userNormalized === canonicalNormalized || userNoSpace === canonicalNoSpace) {
        return {
          isCorrect: true,
          feedback: '✅ Exact match with the canonical solution. Well done!',
          output: '',
        };
      }

      // For specific exercises (e.g., beginner-ex-2-1) allow tolerant similarity matching
      if (
        exercise.id === 'beginner-ex-2-1' ||
        exercise.id === 'beginner-ex-2-2' ||
        exercise.id === 'beginner-ex-2-3' ||
        exercise.id === 'beginner-ex-2-4' ||
        exercise.id === 'beginner-ex-3-1' ||
        exercise.id === 'beginner-ex-3-2' ||
        exercise.id === 'beginner-ex-3-3' ||
        exercise.id === 'beginner-ex-4-1' ||
        exercise.id === 'beginner-ex-4-2' ||
        exercise.id === 'beginner-ex-4-3' ||
        exercise.id === 'beginner-project-3' ||
        exercise.id === 'beginner-project-4' ||
        exercise.id === 'learner-exercise-5-1' ||
        exercise.id === 'learner-exercise-5-2' ||
        exercise.id === 'learner-project-5' ||
        exercise.id === 'learner-exercise-6-1' ||
        exercise.id === 'learner-exercise-6-2' ||
        exercise.id === 'learner-exercise-7-1' ||
        exercise.id === 'learner-exercise-7-2'
        || exercise.id === 'learner-exercise-8-1' || exercise.id === 'learner-exercise-8-2'
      ) {
        // Levenshtein distance implementation
        const levenshtein = (a: string, b: string) => {
          const alen = a.length;
          const blen = b.length;
          if (alen === 0) return blen;
          if (blen === 0) return alen;
          const v0 = new Array(blen + 1).fill(0).map((_, i) => i);
          let v1 = new Array(blen + 1).fill(0);
          for (let i = 0; i < alen; i++) {
            v1[0] = i + 1;
            for (let j = 0; j < blen; j++) {
              const cost = a[i] === b[j] ? 0 : 1;
              v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
            }
            for (let k = 0; k <= blen; k++) v0[k] = v1[k];
          }
          return v1[blen];
        };

        const maxLen = Math.max(userNoSpace.length, canonicalNoSpace.length) || 1;
        const dist = levenshtein(userNoSpace, canonicalNoSpace);
        const similarity = 1 - dist / maxLen;

        // Use a stricter threshold for specific exercises
        const exerciseThreshold = (exercise.id === 'learner-exercise-8-1' || exercise.id === 'learner-exercise-8-2') ? 0.98 : 0.9;

        if (similarity >= exerciseThreshold) {
          return {
            isCorrect: true,
            feedback: `✅ Code is similar to canonical solution (similarity ${(similarity * 100).toFixed(1)}%).`,
            output: '',
          };
        }
      }

      return {
        isCorrect: false,
        feedback: '❌ Your code does not match the canonical solution. Please compare your code with the provided solution.',
        output: '',
      };
    }

    // Fallback: perform output-based validation (legacy behavior)
    const extractedOutput = extractOutputFromCode(code);
    const normalizedCode = code.trim().toLowerCase();

    // PRIMARY CHECK: Compare actual output with expected output
    if (exercise.expectedOutput) {
      const expectedOutput = exercise.expectedOutput.trim();
      const actualOutput = extractedOutput.trim();

      // Exact match check
      if (expectedOutput === actualOutput) {
        return {
          isCorrect: true,
          feedback: '✅ Perfect! Your code produces the exact expected output!',
          output: extractedOutput,
        };
      }

      // Flexible match: normalize whitespace and compare
      const normalizeOutput = (str: string) => {
        return str
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .join('\n');
      };

      const normalizedExpected = normalizeOutput(expectedOutput);
      const normalizedActual = normalizeOutput(actualOutput);

      if (normalizedExpected === normalizedActual) {
        return {
          isCorrect: true,
          feedback: '✅ Excellent work! Your solution produces the correct output!',
          output: extractedOutput,
        };
      }

      // Partial match check
      const expectedLines = normalizedExpected.split('\n');
      const actualLines = normalizedActual.split('\n');
      let matchedLines = 0;

      expectedLines.forEach(expectedLine => {
        if (actualLines.some(actualLine => actualLine.toLowerCase() === expectedLine.toLowerCase())) {
          matchedLines++;
        }
      });

      const matchPercentage = expectedLines.length > 0 ? matchedLines / expectedLines.length : 0;

      if (matchPercentage >= 0.8) {
        return {
          isCorrect: true,
          feedback: '✅ Great job! Your output matches the expected result!',
          output: extractedOutput,
        };
      } else if (matchPercentage >= 0.5) {
        return {
          isCorrect: false,
          feedback: '⚠️ Your output is partially correct. Compare your output with the expected output carefully.',
          output: extractedOutput,
        };
      } else {
        return {
          isCorrect: false,
          feedback: "❌ Your output doesn't match the expected result. Make sure your variables and print statements are correct.",
          output: extractedOutput,
        };
      }
    }

    // Secondary checks if no expected output
    const validationChecks: boolean[] = [];

    // Check for main method
    if (normalizedCode.includes('public static void main')) {
      validationChecks.push(true);
    }

    // Check for System.out.println
    if (normalizedCode.includes('system.out.print')) {
      validationChecks.push(true);
    }

    if (validationChecks.length > 0) {
      const passedChecks = validationChecks.filter(Boolean).length;
      const passRate = passedChecks / validationChecks.length;

      if (passRate >= 0.75) {
        return {
          isCorrect: true,
          feedback: '✅ Excellent work! Your solution looks correct.',
          output: extractedOutput,
        };
      }
    }

    // Fallback
    if (code.length > (exercise.starterCode || '').length + 20) {
      return {
        isCorrect: true,
        feedback: '✅ Solution submitted! Make sure it produces the expected output.',
        output: extractedOutput,
      };
    }

    return {
      isCorrect: false,
      feedback: '⚠️ Your solution seems incomplete. Please review the instructions.',
      output: extractedOutput,
    };
  };

  /**
   * Handle submit
   */
  const handleSubmit = async () => {
    if (exerciseCompleted) {
      toast.info('Exercise already completed');
      return;
    }

    // Force save before submission
    await forceSave();

    setShowDialog(false);
    setValidationState(null);
    setIsSubmitting(true);

    setTimeout(async () => {
      // Validate solution
      const result = validateSolution(userCode);

      // Track submission
      trackEvent('exercise_submit', 'Exercise Submitted', {
        exercise_id: exercise.id,
        module_id: moduleId,
        is_correct: result.isCorrect,
        code_length: userCode.length,
      });

      setValidationState(result);
      setIsSubmitting(false);
      setShowDialog(true);

      // If correct, mark as complete
      if (result.isCorrect) {
        try {
          await completeExercise(moduleId || '', exercise.id, userCode, 100);
          setExerciseCompleted(true);

          // Track completion
          trackEvent('exercise_complete', 'Exercise Completed', {
            exercise_id: exercise.id,
            module_id: moduleId,
            xp_earned: exercise.xpReward,
          });

          toast.success(`Exercise completed! +${exercise.xpReward} XP`);
        } catch (error) {
          console.error('Failed to mark exercise as complete:', error);
        }
      }

      // Call onComplete callback
      onComplete(userCode, result.isCorrect);
    }, 500);
  };

  // Run code feature removed for exercises — submissions only

  /**
   * Format relative time
   */
  const formatRelativeTime = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{exercise.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={
                  exercise.difficulty === 'beginner' ? 'success' :
                    exercise.difficulty === 'intermediate' ? 'default' : 'destructive'
                }>
                  {exercise.difficulty}
                </Badge>
                <Badge variant="outline">
                  <Award className="w-3 h-3 mr-1" />
                  {exercise.xpReward} XP
                </Badge>
                {exerciseCompleted && (
                  <Badge variant="success">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Save Status */}
          <div className="flex items-center gap-2">
            {saveStatus === 'saving' && (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-muted-foreground">Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && lastSaved && (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-muted-foreground">
                  Saved {formatRelativeTime(lastSaved)}
                </span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">Save failed</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Instructions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Exercise Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="prose dark:prose-invert max-w-none space-y-4">
                    <div>
                      <p>{exercise.description}</p>
                    </div>
                    {exercise.expectedOutput && (
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="flex items-center gap-2 mb-0">
                            <FileCheck className="w-5 h-5" />
                            Expected Output
                          </CardTitle>
                          <Badge variant="secondary" className="text-sm">Important!</Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">Your program should produce this exact output</p>

                        <div className="p-4 rounded-md bg-card">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                            <span className="text-sm text-muted-foreground">Console Output</span>
                          </div>

                          <div className="border-t border-dashed border-border mb-3" />

                          <pre className="whitespace-pre-wrap text-sm font-mono">{exercise.expectedOutput}</pre>
                        </div>

                        <div>
                          <div className="inline-flex items-center px-3 py-2 rounded-full bg-primary/10 text-primary text-sm">
                            Match this output exactly to earn {exercise.xpReward ?? 50} XP
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Expected output is now shown inside Instructions to avoid duplication */}

            {/* Hints */}
            {preferences.showHints && exercise.hints && exercise.hints.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Hints
                  </CardTitle>
                  <CardDescription>Click to reveal hints</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    onClick={() => setShowHints(!showHints)}
                    className="mb-2"
                  >
                    {showHints ? <Eye className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showHints ? 'Hide' : 'Show'} Hints
                  </Button>
                  {showHints && (
                    <ul className="space-y-2 mt-2">
                      {exercise.hints.map((hint, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-500" />
                          <span className="text-sm">{hint}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Code Editor */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Your Code
                </CardTitle>
                {exerciseCompleted && (
                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      This exercise has been completed. You can still view and modify your code.
                    </AlertDescription>
                  </Alert>
                )}
              </CardHeader>
              <CardContent>
                <Textarea
                  value={userCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className="font-mono min-h-[500px] text-sm"
                  placeholder="Write your Java code here..."
                  {...getCopyPastePreventionProps()}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      handleTabKey(e);
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Actions - submissions only */}
            <div>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || exerciseCompleted || progressIsLoading || isRefreshingProgress}
                className="w-full"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                {exerciseCompleted ? 'Completed' : 'Submit Solution'}
              </Button>
            </div>
          </div>
        </div>

        {/* Validation Dialog */}
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                {validationState?.isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                {validationState?.isCorrect ? 'Success!' : 'Try Again'}
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <p>{validationState?.feedback}</p>

                  {validationState?.output && (
                    <div>
                      <p className="font-semibold mb-2">Your Output:</p>
                      <pre className="p-4 rounded-lg overflow-x-auto text-sm bg-card">
                        {validationState.output}
                      </pre>
                    </div>
                  )}

                  {exercise.expectedOutput && !validationState?.isCorrect && (
                    <div>
                      <p className="font-semibold mb-2">Expected Output:</p>
                      <pre className="p-4 rounded-lg overflow-x-auto text-sm bg-card">
                        {exercise.expectedOutput}
                      </pre>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button onClick={() => setShowDialog(false)}>
                {validationState?.isCorrect ? 'Continue' : 'Keep Trying'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

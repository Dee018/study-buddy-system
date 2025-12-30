import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { getCopyPastePreventionProps } from '../utils/preventCopyPaste';
import { handleTabKey } from '../utils/codeEditorUtils';
import {
  Trophy,
  Target,
  FileCode,
  CheckCircle,
  Play,
  ArrowLeft,
  Clock,
  Award,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Lock,
  Lightbulb,
  Heart,
  TrendingUp,
  Book
} from 'lucide-react';
import { Project } from '../data/comprehensiveBeginnerCurriculum';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AutoSaveManager } from '../utils/autoSaveManager';
import { validateProjectFriendly, ValidationFeedback } from '../utils/projectValidation';
import { Progress } from './ui/progress';

// Submission state type
export type ProjectSubmissionState = 'not-submitted' | 'submitted-with-errors' | 'submitted-successfully';

interface ProjectViewerProps {
  project: Project;
  onBack: () => void;
  onSubmit: (code: string) => void;
  userId?: string;
  moduleId?: string;
  submissionState?: ProjectSubmissionState;
  lastSubmittedCode?: string;
  isCompleted?: boolean;
  progressIsLoading?: boolean;
  isRefreshingProgress?: boolean;
}

export function ProjectViewer({
  project,
  onBack,
  onSubmit,
  userId,
  moduleId,
  submissionState = 'not-submitted',
  lastSubmittedCode = '',
  isCompleted = false
  , progressIsLoading = false, isRefreshingProgress = false
}: ProjectViewerProps) {
  const [userCode, setUserCode] = useState(project.starterCode || '');
  const [activeTab, setActiveTab] = useState<'overview' | 'code'>('overview');
  const [validationFeedback, setValidationFeedback] = useState<ValidationFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [hasChangedSinceSubmission, setHasChangedSinceSubmission] = useState(false);

  // Load auto-saved code on mount, or last submitted code if returning with errors
  useEffect(() => {
    if (userId && moduleId) {
      const autoSavedCode = AutoSaveManager.loadCode(userId, moduleId, project.id, 'project');
      if (autoSavedCode) {
        setUserCode(autoSavedCode);
      } else if (lastSubmittedCode && submissionState === 'submitted-with-errors') {
        setUserCode(lastSubmittedCode);
      }
    }
  }, [userId, moduleId, project.id, lastSubmittedCode, submissionState]);

  // Auto-validate if there was a previous submission with errors
  useEffect(() => {
    if (submissionState === 'submitted-with-errors') {
      setShowValidation(true);
      const feedback = validateProjectFriendly(
        userCode,
        project.starterCode || '',
        project.requirements,
        project.expectedFeatures,
        moduleId,
        project.id,
        project.solutionCode || ''
      );
      setValidationFeedback(feedback);
      setActiveTab('code');
    } else if (isCompleted) {
      if (lastSubmittedCode) {
        setUserCode(lastSubmittedCode);
      }
    }
  }, [submissionState, isCompleted, lastSubmittedCode, userCode, project.starterCode, project.requirements, project.expectedFeatures]);

  // Check if code has changed from last submission
  useEffect(() => {
    if (lastSubmittedCode) {
      setHasChangedSinceSubmission(userCode.trim() !== lastSubmittedCode.trim());
    } else {
      setHasChangedSinceSubmission(true);
    }
  }, [userCode, lastSubmittedCode]);

  // Start auto-save on mount and cleanup on unmount
  useEffect(() => {
    if (userId && moduleId) {
      AutoSaveManager.startAutoSave(
        userId,
        moduleId,
        project.id,
        'project',
        () => userCode
      );

      return () => {
        AutoSaveManager.saveCode(userId, moduleId, project.id, 'project', userCode);
        const saveKey = `${userId}_${moduleId}_project_${project.id}`;
        AutoSaveManager.stopAutoSave(saveKey);
      };
    }
  }, [userId, moduleId, project.id, userCode]);

  // Real-time validation when code changes
  useEffect(() => {
    if (showValidation && userCode.trim()) {
      const feedback = validateProjectFriendly(
        userCode,
        project.starterCode || '',
        project.requirements,
        project.expectedFeatures,
        moduleId,
        project.id,
        project.solutionCode || ''
      );
      setValidationFeedback(feedback);
    }
  }, [userCode, showValidation, project.starterCode, project.requirements, project.expectedFeatures]);

  // Clear validation when switching tabs (unless there was a previous error submission)
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'overview' | 'code');
    if (submissionState !== 'submitted-with-errors') {
      setShowValidation(false);
      setValidationFeedback(null);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserCode(e.target.value);
    if (lastSubmittedCode) {
      setHasChangedSinceSubmission(e.target.value.trim() !== lastSubmittedCode.trim());
    } else {
      setHasChangedSinceSubmission(true);
    }
  };

  const handleSubmit = () => {
    setShowValidation(true);
    setIsSubmitting(true);

    // Perform beginner-friendly validation
    const feedback = validateProjectFriendly(
      userCode,
      project.starterCode || '',
      project.requirements,
      project.expectedFeatures,
      moduleId,
      project.id,
      project.solutionCode || ''
    );

    setValidationFeedback(feedback);

    if (!feedback.canSubmit || feedback.blockers.length > 0) {
      setIsSubmitting(false);
      setTimeout(() => {
        const feedbackElement = document.getElementById('validation-feedback');
        if (feedbackElement) {
          feedbackElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
      return;
    }

    // If validation passes (80%+ completion), submit the code
    onSubmit(userCode);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">{project.difficulty}</Badge>
              <Badge variant="outline" className="border-purple-300">
                <Clock className="w-3 h-3 mr-1" />
                {project.estimatedTime}
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                <Award className="w-3 h-3 mr-1" />
                {project.points} XP
              </Badge>
            </div>
            <h1 className="text-3xl mb-2 flex items-center space-x-3">
              <Trophy className="w-8 h-8 text-purple-500" />
              <span>{project.title}</span>
            </h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Encouragement Banner */}
        <Card className="no-hover-card mb-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Heart className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-purple-900 dark:text-purple-100">You're learning — mistakes are part of the journey! 💜</p>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                  This project helps you practice real programming. Take your time, experiment, and have fun building something awesome.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="overview" className="flex items-center justify-center">
              <Target className="w-4 h-4 mr-2" />
              Project Overview
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center justify-center">
              <FileCode className="w-4 h-4 mr-2" />
              Code Editor
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Objectives */}
              <Card className="no-hover-card border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                    <Target className="w-5 h-5 text-purple-500" />
                    <span>Project Objectives</span>
                  </CardTitle>
                  <CardDescription>
                    What you'll demonstrate in this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {project.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start space-x-3 text-sm">
                        <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-purple-600 dark:text-purple-300 font-medium">{index + 1}</span>
                        </div>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card className="no-hover-card border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span>Requirements</span>
                  </CardTitle>
                  <CardDescription>
                    Your project should include these elements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {project.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    💡 Tip: Meeting 80% or more of these allows you to submit!
                  </p>
                </CardContent>
              </Card>

              {/* Expected Features */}
              <Card className="no-hover-card lg:col-span-2 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                    <Sparkles className="w-5 h-5 text-green-500" />
                    <span>Expected Features</span>
                  </CardTitle>
                  <CardDescription>
                    Key features your implementation could demonstrate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {project.expectedFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-sm border border-green-100 dark:border-green-900">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Project Stats */}
              <Card className="no-hover-card lg:col-span-2 bg-gradient-to-br from-purple-100/50 to-blue-100/50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="text-4xl mb-3">⏱️</div>
                      <div className="text-xl font-medium mb-1">{project.estimatedTime}</div>
                      <p className="text-sm text-muted-foreground">Estimated Time</p>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="text-4xl mb-3">🏆</div>
                      <div className="text-xl font-medium mb-1">{project.points} XP</div>
                      <p className="text-sm text-muted-foreground">Points Available</p>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="text-4xl mb-3">📊</div>
                      <div className="text-xl font-medium mb-1">{project.difficulty}</div>
                      <p className="text-sm text-muted-foreground">Difficulty Level</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center mt-6">
              <Button size="lg" onClick={() => setActiveTab('code')} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                <FileCode className="w-4 h-4 mr-2" />
                Start Coding
              </Button>
            </div>
          </TabsContent>

          {/* Code Tab */}
          <TabsContent value="code">
            <div className="space-y-6">
              {/* Code Editor */}
              <Card className="no-hover-card border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                      <FileCode className="w-5 h-5 text-purple-500" />
                      <span>Project Code Editor</span>
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUserCode(project.starterCode || '')}
                      className="border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-950"
                    >
                      Reset to Starter Code
                    </Button>
                  </div>
                  <CardDescription>
                    Implement your project solution below — have fun experimenting!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg overflow-hidden border border-purple-200 dark:border-purple-800">
                    <div className="bg-purple-50 dark:bg-purple-950/50 px-4 py-2 border-b border-purple-200 dark:border-purple-800 flex items-center justify-between">
                      <span className="text-sm text-purple-700 dark:text-purple-300 font-mono">Java - NetBeans IDE</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900">Line: 1</Badge>
                        <Badge variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900">Col: 1</Badge>
                      </div>
                    </div>
                    <ScrollArea className="h-[500px]">
                      <Textarea
                        value={userCode}
                        onChange={handleCodeChange}
                        onKeyDown={handleTabKey}
                        className="font-mono text-sm min-h-[500px] border-0 focus-visible:ring-0 rounded-none resize-none"
                        placeholder="// Implement your project here...\n// Remember: you're learning! Try things out and see what happens."
                        spellCheck={false}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        disabled={isCompleted}
                        {...(isCompleted ? {} : getCopyPastePreventionProps())}
                      />
                    </ScrollArea>
                    <div className="bg-purple-50 dark:bg-purple-950/50 px-4 py-2 border-t border-purple-200 dark:border-purple-800">
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        ⌨️ <strong>Full IDE keyboard support:</strong> Tab/Shift+Tab, Ctrl+Z/Y, arrow keys, and all standard shortcuts
                      </p>
                    </div>
                  </div>

                  {/* Quick Reference */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="font-medium text-sm mb-2 flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span>Quick Tips for Success</span>
                    </h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Use meaningful variable names that describe what they store</li>
                      <li>• Add comments to explain your thinking process</li>
                      <li>• Test your logic as you go — start small and build up</li>
                      <li>• Don't worry about perfection — focus on understanding concepts</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Validation Feedback */}
              {validationFeedback && (
                <div id="validation-feedback" className="space-y-4">
                  {/* Progress Indicator */}
                  <Card className="no-hover-card border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5 text-purple-500" />
                          <span className="font-medium">Project Completion</span>
                        </div>
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {validationFeedback.completionPercentage}%
                        </span>
                      </div>
                      <Progress value={validationFeedback.completionPercentage} className="h-3" />
                      <p className="text-xs text-muted-foreground mt-2">
                        {validationFeedback.completionPercentage >= 80
                          ? '🎉 Great job! You can submit when ready.'
                          : `Keep going! You need ${80 - validationFeedback.completionPercentage}% more to submit.`
                        }
                      </p>
                    </CardContent>
                  </Card>

                  {/* Blockers (if any) */}
                  {validationFeedback.blockers.length > 0 && (
                    <Card className="no-hover-card border-orange-200 dark:border-orange-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center space-x-2">
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                          <span>Let's Fix These First</span>
                        </CardTitle>
                        <CardDescription>These prevent your code from running</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {validationFeedback.blockers.map((blocker, index) => (
                            <li key={index} className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                              <p className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">
                                {blocker.message}
                              </p>
                              {blocker.explanation && (
                                <p className="text-xs text-orange-700 dark:text-orange-300 mb-2">
                                  {blocker.explanation}
                                </p>
                              )}
                              {blocker.example && (
                                <div className="mt-2 p-2 bg-orange-100 dark:bg-orange-900/50 rounded border border-orange-200 dark:border-orange-700">
                                  <p className="text-xs text-orange-600 dark:text-orange-400 font-mono whitespace-pre-wrap">
                                    {blocker.example}
                                  </p>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* What You Did Great */}
                  {validationFeedback.correctImplementations.length > 0 && (
                    <Card className="no-hover-card border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>What You Did Great! 🌟</span>
                        </CardTitle>
                        <CardDescription>Keep up the excellent work</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {validationFeedback.correctImplementations.map((item, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-green-900 dark:text-green-100">{item.message}</p>
                                {item.explanation && (
                                  <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                                    {item.explanation}
                                  </p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Suggestions for Improvement */}
                  {validationFeedback.suggestions.length > 0 && (
                    <Card className="no-hover-card border-blue-200 dark:border-blue-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center space-x-2">
                          <Lightbulb className="w-5 h-5 text-blue-500" />
                          <span>Ideas to Make It Even Better 💡</span>
                        </CardTitle>
                        <CardDescription>Optional improvements (not required to submit)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {validationFeedback.suggestions.map((suggestion, index) => (
                            <li key={index} className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                                {suggestion.message}
                              </p>
                              {suggestion.explanation && (
                                <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                                  {suggestion.explanation}
                                </p>
                              )}
                              {suggestion.example && (
                                <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/50 rounded border border-blue-200 dark:border-blue-700">
                                  <p className="text-xs text-blue-600 dark:text-blue-400 font-mono whitespace-pre-wrap">
                                    {suggestion.example}
                                  </p>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Educational Tips */}
                  {validationFeedback.educationalTips.length > 0 && (
                    <Card className="no-hover-card border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center space-x-2">
                          <Book className="w-5 h-5 text-purple-500" />
                          <span>Learning Tips 📚</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {validationFeedback.educationalTips.map((tip, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm text-purple-900 dark:text-purple-100">
                              <span className="flex-shrink-0">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Submission Section */}
              <Card className={
                isCompleted
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800"
                  : "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800"
              }>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Completed Project Status */}
                    {isCompleted && (
                      <div className="flex items-center space-x-3 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-200 dark:bg-green-800">
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-green-700 dark:text-green-300">Project Completed! 🎉</p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Fantastic work! You've successfully completed this project.
                          </p>
                        </div>
                        <Lock className="w-5 h-5 text-green-600/50 dark:text-green-400/50" />
                      </div>
                    )}

                    {/* Previous Submission Feedback */}
                    {submissionState === 'submitted-with-errors' && !isCompleted && (
                      <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
                        <Lightbulb className="h-5 w-5 text-blue-500" />
                        <AlertTitle className="text-blue-900 dark:text-blue-100">Keep Going! 💪</AlertTitle>
                        <AlertDescription className="text-blue-700 dark:text-blue-300">
                          You're on the right track. Check the feedback above and make improvements when you're ready.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* No Changes Warning */}
                    {submissionState !== 'not-submitted' && !hasChangedSinceSubmission && !isCompleted && (
                      <Alert className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30">
                        <AlertCircle className="h-5 w-5 text-purple-500" />
                        <AlertTitle className="text-purple-900 dark:text-purple-100">Try Making Some Changes</AlertTitle>
                        <AlertDescription className="text-purple-700 dark:text-purple-300">
                          Your code looks the same as before. Try updating it based on the feedback!
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Submit/Resubmit Button */}
                    {!isCompleted && (
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium mb-1 flex items-center space-x-2">
                            {submissionState === 'not-submitted' ? (
                              <>
                                <Play className="w-5 h-5 text-purple-500" />
                                <span>Ready to submit?</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-5 h-5 text-blue-500" />
                                <span>Ready to try again?</span>
                              </>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {validationFeedback && validationFeedback.blockers.length > 0
                              ? 'Fix the issues above first, then you can submit'
                              : validationFeedback && validationFeedback.completionPercentage < 80
                                ? `Complete ${80 - validationFeedback.completionPercentage}% more to unlock submission`
                                : submissionState !== 'not-submitted' && !hasChangedSinceSubmission
                                  ? 'Make changes to your code before resubmitting'
                                  : 'Click below when you\'re ready!'
                            }
                          </p>
                        </div>
                        <Button
                          size="lg"
                          onClick={handleSubmit}
                          disabled={
                            isCompleted ||
                            isSubmitting ||
                            progressIsLoading || isRefreshingProgress ||
                            (validationFeedback && validationFeedback.blockers.length > 0) ||
                            (validationFeedback && validationFeedback.completionPercentage < 80) ||
                            (submissionState !== 'not-submitted' && !hasChangedSinceSubmission)
                          }
                          className={
                            submissionState !== 'not-submitted'
                              ? "min-w-[200px] bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                              : "min-w-[200px] bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                          }
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Checking...
                            </>
                          ) : validationFeedback && validationFeedback.blockers.length > 0 ? (
                            <>
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Fix Issues First
                            </>
                          ) : validationFeedback && validationFeedback.completionPercentage < 80 ? (
                            <>
                              <TrendingUp className="w-4 h-4 mr-2" />
                              {validationFeedback.completionPercentage}% Complete
                            </>
                          ) : submissionState !== 'not-submitted' && !hasChangedSinceSubmission ? (
                            <>
                              <AlertCircle className="w-4 h-4 mr-2" />
                              No Changes Yet
                            </>
                          ) : submissionState === 'not-submitted' ? (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Submit Project
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Resubmit Project
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Completed Project Info */}
                    {isCompleted && (
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium mb-1 flex items-center space-x-2">
                            <Trophy className="w-5 h-5 text-green-500" />
                            <span>Project Complete</span>
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            You can review your code above. Great job on completing this project!
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                            {project.points} XP Earned
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

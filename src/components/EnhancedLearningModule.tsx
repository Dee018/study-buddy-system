import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import {
  BookOpen,
  Code,
  CheckCircle,
  Lock,
  Zap,
  Lightbulb,
  Target,
  ArrowLeft,
  Play,
  Trophy,
  Rocket,
  Clock
} from 'lucide-react';
import { DetailedModule, Exercise, Project, DetailedLesson } from '../data/comprehensiveBeginnerCurriculum';

interface EnhancedLearningModuleProps {
  module: DetailedModule;
  onBack: () => void;
  onStartExercise: (exercise: Exercise) => void;
  onStartProject: (project: Project) => void;
  onStartLesson: (lesson: DetailedLesson) => void;
  userProgress: {
    completedLessons: string[];
    completedExercises: string[];
    projectCompleted: boolean;
  };
  initialTab?: 'lessons' | 'exercises' | 'project';
  progressIsLoading?: boolean;
  isRefreshingProgress?: boolean;
}

export function EnhancedLearningModule({
  module,
  onBack,
  onStartExercise,
  onStartProject,
  onStartLesson,
  userProgress,
  initialTab = 'lessons'
  , progressIsLoading = false, isRefreshingProgress = false
}: EnhancedLearningModuleProps) {
  const [activeTab, setActiveTab] = useState<'lessons' | 'exercises' | 'project'>(initialTab);

  // Calculate module completion
  const totalItems = module.lessons.length + (module.handsOnExercises?.length || 0) + (module.assessmentProject ? 1 : 0);
  const completedItems = userProgress.completedLessons.length +
    userProgress.completedExercises.length +
    (userProgress.projectCompleted ? 1 : 0);
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">Module {module.week}</Badge>
              <Badge variant="secondary" className="text-xs">{module.category}</Badge>
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {module.estimatedHours}h
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Title and Description - More Compact */}
        <div className="mb-4">
          <h1 className="text-2xl mb-1">{module.title}</h1>
          <p className="text-sm text-muted-foreground">{module.description}</p>
        </div>

        {/* Progress and Learning Objectives Side by Side */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Progress Card - Compact */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Module Progress</span>
                <span className="font-medium text-primary">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="mb-3 h-3 bg-primary/20" />
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-sm font-medium">{userProgress.completedLessons.length}/{module.lessons.length}</div>
                  <div className="text-xs text-muted-foreground">Lessons</div>
                </div>
                <div>
                  <div className="text-sm font-medium">{userProgress.completedExercises.length}/{module.handsOnExercises?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Exercises</div>
                </div>
                <div>
                  <div className="text-sm font-medium">{userProgress.projectCompleted ? '1/1' : '0/1'}</div>
                  <div className="text-xs text-muted-foreground">Project</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Objectives - Compact */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Learning Objectives</span>
              </div>
              <div className="space-y-1.5">
                {module.objectives.map((objective, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground leading-relaxed">{objective}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="lessons" className="text-sm flex items-center justify-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Lessons</span>
            </TabsTrigger>
            <TabsTrigger value="exercises" className="text-sm flex items-center justify-center gap-2">
              <Code className="w-4 h-4" />
              <span>Practice</span>
            </TabsTrigger>
            <TabsTrigger value="project" className="text-sm flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>Project</span>
            </TabsTrigger>
          </TabsList>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="mt-0">
            <ScrollArea className="h-[calc(100vh-340px)] scroll-smooth">
              <div className="space-y-2 pr-4 pb-20">
                {module.lessons.map((lesson, index) => {
                  const isCompleted = userProgress.completedLessons.includes(lesson.id);
                  const canAccess = index === 0 || userProgress.completedLessons.includes(module.lessons[index - 1].id);

                  return (
                    <Card key={lesson.id} className={`no-hover-card ${!canAccess && 'opacity-60'}`}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          {/* Number/Status */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-primary text-primary-foreground' :
                            canAccess ? 'bg-primary/10 text-primary' :
                              'bg-muted text-muted-foreground'
                            }`}>
                            {isCompleted ? <CheckCircle className="w-4 h-4" /> :
                              canAccess ? <span className="text-sm">{index + 1}</span> :
                                <Lock className="w-4 h-4" />}
                          </div>

                          {/* Lesson Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium mb-0.5">{lesson.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{lesson.description}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs h-5 px-2">
                                <Clock className="w-3 h-3 mr-1" />
                                {lesson.duration}
                              </Badge>
                              <Badge variant="secondary" className="text-xs h-5 px-2">{lesson.difficulty}</Badge>
                              <Badge variant="secondary" className="text-xs h-5 px-2">
                                <Zap className="w-3 h-3 mr-1" />
                                {lesson.difficulty === 'Easy' ? 50 : lesson.difficulty === 'Intermediate' ? 75 : 100} XP
                              </Badge>
                              <span className="text-xs text-muted-foreground">{lesson.concepts.length} concepts</span>
                            </div>
                          </div>

                          {/* Action */}
                          <Button
                            size="sm"
                            variant={isCompleted ? "outline" : "default"}
                            disabled={!canAccess || progressIsLoading || isRefreshingProgress}
                            onClick={() => (canAccess && !progressIsLoading && !isRefreshingProgress) && onStartLesson(lesson)}
                            className="flex-shrink-0"
                          >
                            {isCompleted ? (
                              <><CheckCircle className="w-3 h-3 mr-1" />Review</>
                            ) : (
                              <><Play className="w-3 h-3 mr-1" />Start</>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Exercises Tab */}
          <TabsContent value="exercises" className="mt-0">
            <ScrollArea className="h-[calc(100vh-340px)] scroll-smooth">
              <div className="space-y-2 pr-4 pb-20">
                {module.handsOnExercises && module.handsOnExercises.length > 0 ? (
                  module.handsOnExercises.map((exercise, index) => {
                    const isCompleted = userProgress.completedExercises.includes(exercise.id);
                    const allLessonsCompleted = userProgress.completedLessons.length >= module.lessons.length;
                    const previousExerciseCompleted = index === 0 ||
                      userProgress.completedExercises.includes(module.handsOnExercises[index - 1].id);
                    const canAccess = allLessonsCompleted && previousExerciseCompleted;

                    return (
                      <Card key={exercise.id} className={`no-hover-card ${!canAccess && 'opacity-60'}`}>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-primary text-primary-foreground' :
                              canAccess ? 'bg-accent/10 text-accent' :
                                'bg-muted text-muted-foreground'
                              }`}>
                              {isCompleted ? <CheckCircle className="w-4 h-4" /> :
                                canAccess ? <Code className="w-4 h-4" /> :
                                  <Lock className="w-4 h-4" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium mb-0.5">{exercise.title}</h3>
                              <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{exercise.description}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs h-5 px-2">{exercise.difficulty}</Badge>
                                <Badge variant="secondary" className="text-xs h-5 px-2">
                                  <Zap className="w-3 h-3 mr-1" />
                                  {exercise.points} XP
                                </Badge>
                                {!allLessonsCompleted && (
                                  <span className="text-xs text-muted-foreground">Complete lessons first</span>
                                )}
                                {allLessonsCompleted && !previousExerciseCompleted && index > 0 && (
                                  <span className="text-xs text-muted-foreground">Complete previous exercise</span>
                                )}
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant={isCompleted ? "outline" : "default"}
                              disabled={!canAccess || progressIsLoading || isRefreshingProgress}
                              onClick={() => (canAccess && !progressIsLoading && !isRefreshingProgress) && onStartExercise(exercise)}
                              className="flex-shrink-0"
                            >
                              {isCompleted ? 'Review' : 'Start'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <Card className="no-hover-card">
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <Code className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No practice exercises available for this module yet.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Project Tab */}
          <TabsContent value="project" className="mt-0">
            {module.assessmentProject ? (
              (() => {
                const totalItems = module.lessons.length + (module.handsOnExercises?.length || 0) + 1;
                const completedItems = userProgress.completedLessons.length +
                  userProgress.completedExercises.length +
                  (userProgress.projectCompleted ? 1 : 0);
                const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
                const canAccessProject = completionPercentage >= 80 || userProgress.projectCompleted;

                return (
                  <Card className={`no-hover-card ${!canAccessProject && 'opacity-60'}`}>
                    <CardContent className="p-6">
                      {/* Project Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${userProgress.projectCompleted ? 'bg-primary text-primary-foreground' :
                          canAccessProject ? 'bg-primary/10 text-primary' :
                            'bg-muted text-muted-foreground'
                          }`}>
                          {userProgress.projectCompleted ? (
                            <Trophy className="w-6 h-6" />
                          ) : canAccessProject ? (
                            <Rocket className="w-6 h-6" />
                          ) : (
                            <Lock className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium mb-1">{module.assessmentProject.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{module.assessmentProject.description}</p>
                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant="outline">{module.assessmentProject.difficulty}</Badge>
                            <Badge variant="secondary">
                              <Zap className="w-3 h-3 mr-1" />
                              {module.assessmentProject.points} XP
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Requirements */}
                      {!canAccessProject && (
                        <div className="bg-muted/50 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Lock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Project Locked</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            Complete at least 80% of lessons and exercises to unlock this project.
                          </p>
                          <div className="flex items-center gap-2">
                            <Progress value={completionPercentage} className="flex-1 h-2" />
                            <span className="text-xs font-medium">{completionPercentage}%</span>
                          </div>
                        </div>
                      )}

                      {/* Learning Outcomes */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-primary" />
                          What You'll Build
                        </h4>
                        <div className="space-y-1">
                          {module.assessmentProject.objectives?.map((objective, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                              <span className="text-xs text-muted-foreground">{objective}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        className="w-full"
                        disabled={!canAccessProject || progressIsLoading || isRefreshingProgress}
                        onClick={() => (canAccessProject && !progressIsLoading && !isRefreshingProgress) && onStartProject(module.assessmentProject!)}
                      >
                        {userProgress.projectCompleted ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Review Project
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start Project
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })()
            ) : (
              <Card className="no-hover-card">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No assessment project available for this module yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
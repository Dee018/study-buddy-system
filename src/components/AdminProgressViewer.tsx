/**
 * Admin Progress Viewer
 * Real-time view of learner progress with full system consistency
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useProgressSync, useProgressSnapshot, useCompletionStats, useProgressConsistency } from '../utils/useProgressSync';
import ContentManager from '../utils/contentManager';
import { DetailedModule } from '../data/comprehensiveBeginnerCurriculum';
import {
  CheckCircle,
  Circle,
  Code,
  BookOpen,
  FolderKanban,
  AlertTriangle,
  RefreshCw,
  Eye,
  Zap,
  Award,
  Clock,
  FileCode
} from 'lucide-react';

interface AdminProgressViewerProps {
  userId: string;
  username: string;
  onClose: () => void;
}

export function AdminProgressViewer({ userId, username, onClose }: AdminProgressViewerProps) {
  // Use sync hooks for real-time updates
  const { progress, lastUpdate, refresh: refreshProgress } = useProgressSync(userId);
  const { snapshot } = useProgressSnapshot(userId);
  const { stats } = useCompletionStats(userId);
  const { issues, hasIssues, fix: fixIssues, check: _checkIssues } = useProgressConsistency(userId);
  // intentionally reference to acknowledge unused extractor in lint
  void _checkIssues;

  const [modules, setModules] = useState<DetailedModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<DetailedModule | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  // Load all modules
  useEffect(() => {
    const allModules = ContentManager.getAllModules();
    const publishedModules = allModules.filter(m =>
      ContentManager.isPublished(m.id) && !(m as any).isDeleted
    );
    setModules(publishedModules);
  }, []);

  if (!progress || !snapshot) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-2">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-500" />
          <p className="text-muted-foreground">Loading progress data...</p>
        </div>
      </div>
    );
  }

  const handleFixIssues = async () => {
    const result = await fixIssues();
    alert(`Fixed ${result.fixed} inconsistencies`);
    refreshProgress();
  };

  const getModuleStatus = (moduleId: string): 'completed' | 'in-progress' | 'not-started' => {
    if (progress.completedModules.includes(moduleId)) {
      return 'completed';
    }

    const moduleProgress = progress.moduleProgress[moduleId];
    if (moduleProgress && typeof moduleProgress === 'object') {
      const hasAnyProgress =
        (moduleProgress.completedLessons && moduleProgress.completedLessons.length > 0) ||
        (moduleProgress.completedExercises && moduleProgress.completedExercises.length > 0) ||
        moduleProgress.projectCompleted;

      return hasAnyProgress ? 'in-progress' : 'not-started';
    }

    return 'not-started';
  };

  const getModuleProgressPercentage = (module: DetailedModule): number => {
    const moduleProgress = progress.moduleProgress[module.id];

    if (!moduleProgress || typeof moduleProgress !== 'object') {
      return 0;
    }

    const totalLessons = module.lessons?.length || 0;
    const totalExercises = module.handsOnExercises?.length || 0;
    const hasProject = module.assessmentProject ? 1 : 0;
    const totalItems = totalLessons + totalExercises + hasProject;

    if (totalItems === 0) return 0;

    const completedLessons = moduleProgress.completedLessons?.length || 0;
    const completedExercises = moduleProgress.completedExercises?.length || 0;
    const completedProject = moduleProgress.projectCompleted ? 1 : 0;
    const completedItems = completedLessons + completedExercises + completedProject;

    return Math.round((completedItems / totalItems) * 100);
  };

  const _getStatusColor = (status: 'completed' | 'in-progress' | 'not-started') => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'in-progress':
        return 'text-yellow-500';
      case 'not-started':
        return 'text-gray-400';
    }
  };
  void _getStatusColor;

  const getStatusBadge = (status: 'completed' | 'in-progress' | 'not-started') => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">In Progress</Badge>;
      case 'not-started':
        return <Badge variant="outline" className="text-gray-500">Not Started</Badge>;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Modules</p>
                <p className="text-2xl font-bold">{stats.totalModules}/12</p>
              </div>
              <FolderKanban className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lessons</p>
                <p className="text-2xl font-bold">{stats.totalLessons}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Exercises</p>
                <p className="text-2xl font-bold">{stats.totalExercises}</p>
              </div>
              <Code className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold">{stats.totalXP.toLocaleString()}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Completion</CardTitle>
          <CardDescription>Total learning progress across all modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{stats.completionPercentage}% Complete</span>
              <span className="text-sm text-muted-foreground">
                {stats.totalLessons + stats.totalExercises + stats.totalProjects} items completed
              </span>
            </div>
            <Progress value={stats.completionPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Consistency Check */}
      {hasIssues && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
              <AlertTriangle className="w-5 h-5" />
              Progress Inconsistencies Detected
            </CardTitle>
            <CardDescription>
              {issues.length} issue(s) found that may affect accuracy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-1 text-sm">
              {issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Circle className="w-3 h-3 mt-1 flex-shrink-0" />
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
            <Button onClick={handleFixIssues} variant="outline" size="sm" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Auto-Fix Issues
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Module List */}
      <Card>
        <CardHeader>
          <CardTitle>Module Progress</CardTitle>
          <CardDescription>Detailed breakdown by module</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {modules.map(module => {
                const status = getModuleStatus(module.id);
                const progressPercentage = getModuleProgressPercentage(module);
                const moduleProgress = progress.moduleProgress[module.id];

                return (
                  <div
                    key={module.id}
                    className="border rounded-xl p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedModule(module);
                      setViewMode('detailed');
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{module.title}</h4>
                          {getStatusBadge(status)}
                        </div>
                        <p className="text-sm text-muted-foreground">Week {module.week} • {module.category}</p>
                      </div>
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{progressPercentage}% complete</span>
                        {moduleProgress && typeof moduleProgress === 'object' && (
                          <span className="text-muted-foreground">
                            {(moduleProgress.completedLessons?.length || 0)} lessons •
                            {(moduleProgress.completedExercises?.length || 0)} exercises •
                            {moduleProgress.projectCompleted ? ' ✓' : ' ○'} project
                          </span>
                        )}
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Last updated: {new Date(lastUpdate).toLocaleString()}</span>
        </div>
        <Button onClick={refreshProgress} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );

  const renderDetailed = () => {
    if (!selectedModule) return null;

    const moduleProgress = progress.moduleProgress[selectedModule.id];
    const moduleData = typeof moduleProgress === 'object' ? moduleProgress : {
      completedLessons: [],
      completedExercises: [],
      projectCompleted: false
    };

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button onClick={() => setViewMode('overview')} variant="outline">
          ← Back to Overview
        </Button>

        {/* Module Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{selectedModule.title}</CardTitle>
                <CardDescription>Week {selectedModule.week} • {selectedModule.category}</CardDescription>
              </div>
              {getStatusBadge(getModuleStatus(selectedModule.id))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Module Progress</span>
                <span className="font-medium">{getModuleProgressPercentage(selectedModule)}%</span>
              </div>
              <Progress value={getModuleProgressPercentage(selectedModule)} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="lessons" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lessons">
              <BookOpen className="w-4 h-4 mr-2" />
              Lessons ({moduleData.completedLessons?.length || 0}/{selectedModule.lessons?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="exercises">
              <Code className="w-4 h-4 mr-2" />
              Exercises ({moduleData.completedExercises?.length || 0}/{selectedModule.handsOnExercises?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="project">
              <FolderKanban className="w-4 h-4 mr-2" />
              Project
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="space-y-3 mt-4">
            {selectedModule.lessons?.map((lesson) => {
              const isCompleted = moduleData.completedLessons?.includes(lesson.id);
              return (
                <div
                  key={lesson.id}
                  className={`border rounded-xl p-4 ${isCompleted ? 'bg-green-500/5 border-green-500/20' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{lesson.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {lesson.duration} • {lesson.difficulty}
                      </p>
                    </div>
                    {isCompleted && (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="exercises" className="space-y-3 mt-4">
            {selectedModule.handsOnExercises?.map((exercise) => {
              const isCompleted = moduleData.completedExercises?.includes(exercise.id);
              const hasCode = moduleData.exerciseCodes?.[exercise.id];

              return (
                <div
                  key={exercise.id}
                  className={`border rounded-xl p-4 ${isCompleted ? 'bg-green-500/5 border-green-500/20' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{exercise.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {exercise.difficulty} • {exercise.points} XP
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasCode && (
                        <Badge variant="outline" className="text-blue-500 border-blue-500/20">
                          <FileCode className="w-3 h-3 mr-1" />
                          Code Saved
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="project" className="mt-4">
            {selectedModule.assessmentProject ? (
              <div
                className={`border rounded-xl p-6 ${moduleData.projectCompleted ? 'bg-green-500/5 border-green-500/20' : ''}`}
              >
                <div className="flex items-start gap-3 mb-4">
                  {moduleData.projectCompleted ? (
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-1">{selectedModule.assessmentProject.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {selectedModule.assessmentProject.difficulty} • {selectedModule.assessmentProject.points} XP
                    </p>
                    <p className="text-sm">{selectedModule.assessmentProject.description}</p>
                  </div>
                </div>

                {moduleData.projectCompleted && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <Award className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-green-500">Project Completed!</span>
                    {moduleData.projectCode && (
                      <Badge variant="outline" className="ml-auto text-blue-500 border-blue-500/20">
                        <FileCode className="w-3 h-3 mr-1" />
                        Code Submitted
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No project available for this module
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Progress Viewer: {username}</h2>
          <p className="text-sm text-muted-foreground">Real-time learner progress tracking</p>
        </div>
        <Button onClick={onClose} variant="outline">Close</Button>
      </div>

      {/* Content */}
      {viewMode === 'overview' ? renderOverview() : renderDetailed()}
    </div>
  );
}

/**
 * Admin Progress Monitor Component
 * Real-time progress monitoring for admin dashboard with learner state mirroring
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  useProgressSnapshot,
  useCompletionStats,
  useProgressConsistency
} from '../utils/useProgressSync';
import {
  CheckCircle,
  PlayCircle,
  Award,
  BookOpen,
  Code,
  Trophy,
  AlertTriangle,
  RefreshCw,
  Eye,
  Zap
} from 'lucide-react';

interface AdminProgressMonitorProps {
  userId: string;
  username?: string;
  onClose?: () => void;
}

export function AdminProgressMonitor({ userId, username, onClose }: AdminProgressMonitorProps) {
  const { snapshot, lastUpdate, refresh } = useProgressSnapshot(userId);
  const { stats } = useCompletionStats(userId);
  const { issues, hasIssues, fix } = useProgressConsistency(userId);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 10000);

    return () => clearInterval(interval);
  }, [refresh]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleFixIssues = async () => {
    await fix();
    refresh();
  };

  if (!snapshot) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Loading progress data...
          </div>
        </CardContent>
      </Card>
    );
  }

  const lastUpdateTime = new Date(lastUpdate).toLocaleTimeString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Progress Monitor: {username || userId}</h2>
          <p className="text-sm text-muted-foreground">
            Real-time learner progress state • Last updated: {lastUpdateTime}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Consistency Issues Alert */}
      {hasIssues && (
        <Card className="border-orange-500/50 bg-orange-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <AlertTriangle className="w-5 h-5" />
              Progress Consistency Issues Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {issues.map((issue, idx) => (
                <div key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>{issue}</span>
                </div>
              ))}
            </div>
            <Button onClick={handleFixIssues} size="sm">
              Fix Issues Automatically
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold">{snapshot.totalXP.toLocaleString()}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Modules</p>
                <p className="text-2xl font-bold">{stats.totalModules}/12</p>
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
                <p className="text-sm text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold">{stats.totalProjects}</p>
              </div>
              <Trophy className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Details */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Completion</CardTitle>
          <CardDescription>
            {stats.completionPercentage}% complete across all modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={stats.completionPercentage} className="h-3" />
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Lessons</p>
              <p className="text-xl font-semibold">{stats.totalLessons}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Exercises</p>
              <p className="text-xl font-semibold">{stats.totalExercises}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Projects</p>
              <p className="text-xl font-semibold">{stats.totalProjects}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module-by-Module Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Module Progress (Learner View Mirror)</CardTitle>
          <CardDescription>
            Exact state as seen by the learner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="completed">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="completed">
                Completed ({snapshot.completedModules.length})
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                In Progress
              </TabsTrigger>
              <TabsTrigger value="all">
                All Modules
              </TabsTrigger>
            </TabsList>

            <TabsContent value="completed" className="space-y-3 mt-4">
              <ScrollArea className="h-[400px] pr-4">
                {snapshot.completedModules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No completed modules yet
                  </div>
                ) : (
                  snapshot.completedModules.map((moduleId) => {
                    const lessons = snapshot.completedLessons[moduleId] || [];
                    const exercises = snapshot.completedExercises[moduleId] || [];
                    const hasProject = snapshot.completedProjects.includes(moduleId);

                    return (
                      <Card key={moduleId} className="mb-3 border-green-500/30 bg-green-500/5">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <h3 className="font-semibold">{moduleId}</h3>
                                <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30">
                                  Completed
                                </Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Lessons</p>
                                  <p className="font-medium">{lessons.length} ✓</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Exercises</p>
                                  <p className="font-medium">{exercises.length} ✓</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Project</p>
                                  <p className="font-medium">{hasProject ? '1 ✓' : '0'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="in-progress" className="space-y-3 mt-4">
              <ScrollArea className="h-[400px] pr-4">
                {(() => {
                  const inProgressModules = Object.keys(snapshot.completedLessons)
                    .filter(moduleId => !snapshot.completedModules.includes(moduleId));

                  if (inProgressModules.length === 0) {
                    return (
                      <div className="text-center py-8 text-muted-foreground">
                        No modules in progress
                      </div>
                    );
                  }

                  return inProgressModules.map((moduleId) => {
                    const lessons = snapshot.completedLessons[moduleId] || [];
                    const exercises = snapshot.completedExercises[moduleId] || [];
                    const hasProject = snapshot.completedProjects.includes(moduleId);

                    return (
                      <Card key={moduleId} className="mb-3 border-blue-500/30 bg-blue-500/5">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <PlayCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold">{moduleId}</h3>
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                                  In Progress
                                </Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Lessons</p>
                                  <p className="font-medium">{lessons.length}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Exercises</p>
                                  <p className="font-medium">{exercises.length}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Project</p>
                                  <p className="font-medium">{hasProject ? '✓' : '—'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  });
                })()}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="all" className="space-y-3 mt-4">
              <ScrollArea className="h-[400px] pr-4">
                {Object.entries(snapshot.completedLessons).map(([moduleId, lessons]) => {
                  const exercises = snapshot.completedExercises[moduleId] || [];
                  const hasProject = snapshot.completedProjects.includes(moduleId);
                  const isCompleted = snapshot.completedModules.includes(moduleId);

                  return (
                    <Card key={moduleId} className="mb-3">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                              ) : (
                                <PlayCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              )}
                              <h3 className="font-semibold">{moduleId}</h3>
                              <Badge
                                variant="outline"
                                className={isCompleted
                                  ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                                }
                              >
                                {isCompleted ? 'Completed' : 'In Progress'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Lessons</p>
                                <p className="font-medium">{lessons.length}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Exercises</p>
                                <p className="font-medium">{exercises.length}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Project</p>
                                <p className="font-medium">{hasProject ? '✓' : '—'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Assessment Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Assessment Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completed Assessments</span>
              <span className="font-semibold">{snapshot.assessmentResults}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Streak</span>
              <span className="font-semibold">{snapshot.currentStreak} days</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Raw Data View (for debugging) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Developer Tools</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRawData(!showRawData)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showRawData ? 'Hide' : 'Show'} Raw Data
            </Button>
          </div>
        </CardHeader>
        {showRawData && (
          <CardContent>
            <ScrollArea className="h-[300px]">
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(snapshot, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

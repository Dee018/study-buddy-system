import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  ArrowLeft,
  BookOpen,
  Code,
  Lightbulb,
  Target,
  CheckCircle,
  Brain,
  Zap,
  FileCode,
  PlayCircle,
  Clock
} from 'lucide-react';
import { DetailedLesson } from '../data/comprehensiveBeginnerCurriculum';

interface LessonViewProps {
  lesson: DetailedLesson;
  moduleTitle: string;
  onBack: () => void;
  onComplete: () => void;
  isCompleted: boolean;
  progressIsLoading?: boolean;
  isRefreshingProgress?: boolean;
}

export function LessonView({ lesson, moduleTitle, onBack, onComplete, isCompleted }: LessonViewProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { progressIsLoading = false, isRefreshingProgress = false } = (arguments[0] || {} as any);
  const [activeConceptIndex, setActiveConceptIndex] = useState(0);
  const [readProgress, setReadProgress] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    try {
      const element = e.currentTarget;
      if (!element) return;

      const scrollHeight = element.scrollHeight || 0;
      const clientHeight = element.clientHeight || 0;
      const scrollTop = element.scrollTop || 0;

      const denominator = scrollHeight - clientHeight;
      // Prevent division by zero
      if (denominator <= 0) {
        setReadProgress(100);
        return;
      }

      const scrollPercentage = (scrollTop / denominator) * 100;
      const progress = isFinite(scrollPercentage) ? Math.min(scrollPercentage, 100) : 0;
      setReadProgress(Math.max(0, progress));
    } catch (error) {
      console.error('Error calculating scroll progress:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button variant="ghost" size="sm" onClick={onBack} className="flex-shrink-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm sm:text-base font-medium truncate">{lesson.title}</h2>
                <p className="text-xs text-muted-foreground truncate">{moduleTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs hidden sm:flex">
                <Clock className="w-3 h-3 mr-1" />
                {lesson.duration}
              </Badge>
              <Badge variant="secondary" className="text-xs">{lesson.difficulty}</Badge>
            </div>
          </div>
          <Progress value={readProgress} className="h-1 mt-2" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Overview */}
            <Card className="no-hover-card">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl mb-2">{lesson.title}</CardTitle>
                    <CardDescription className="text-sm">{lesson.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-medium">What You'll Learn</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {lesson.concepts.map((concept, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{concept}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Theoretical Foundation */}
            {lesson.theoreticalFoundation && lesson.theoreticalFoundation.length > 0 && (
              <Card className="no-hover-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">Theoretical Foundation</CardTitle>
                  </div>
                  <CardDescription>Understanding the concepts behind the code</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-auto max-h-[400px]" onScrollCapture={handleScroll}>
                    <div className="space-y-4 pr-4">
                      {lesson.theoreticalFoundation.map((theory, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-xs text-primary font-medium">{idx + 1}</span>
                          </div>
                          <p className="text-sm leading-relaxed text-muted-foreground">{theory}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Interactive Concept Explorer */}
            <Card className="no-hover-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Key Concepts Deep Dive</CardTitle>
                </div>
                <CardDescription>Explore each concept in detail</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeConceptIndex.toString()} onValueChange={(v) => {
                  const parsed = parseInt(v, 10);
                  setActiveConceptIndex(isNaN(parsed) ? 0 : parsed);
                }}>
                  <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${lesson.concepts.length}, 1fr)` }}>
                    {lesson.concepts.map((concept, idx) => (
                      <TabsTrigger key={idx} value={idx.toString()} className="text-xs px-2">
                        {idx + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {lesson.concepts.map((concept, idx) => (
                    <TabsContent key={idx} value={idx.toString()} className="mt-4">
                      <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-accent">{idx + 1}</span>
                          </div>
                          <h3 className="font-medium">{concept}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          This concept focuses on {concept.toLowerCase()}. Understanding this is crucial for mastering {lesson.title.toLowerCase()}.
                          {lesson.theoreticalFoundation && lesson.theoreticalFoundation[idx] && (
                            <span className="block mt-2">{lesson.theoreticalFoundation[idx]}</span>
                          )}
                        </p>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeConceptIndex === 0}
                    onClick={() => setActiveConceptIndex(activeConceptIndex - 1)}
                  >
                    Previous Concept
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {activeConceptIndex + 1} of {lesson.concepts.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeConceptIndex === lesson.concepts.length - 1}
                    onClick={() => setActiveConceptIndex(activeConceptIndex + 1)}
                  >
                    Next Concept
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Code Examples */}
            {lesson.codeExamples && lesson.codeExamples.length > 0 && (
              <Card className="no-hover-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">Code Examples</CardTitle>
                  </div>
                  <CardDescription>Practical implementation of the concepts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lesson.codeExamples.map((example, idx) => (
                    <div key={idx} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-primary" />
                        <h4 className="font-medium text-sm">{example.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{example.description}</p>
                      <div className="bg-muted rounded-lg overflow-hidden border">
                        <div className="bg-muted-foreground/10 px-4 py-2 border-b flex items-center justify-between">
                          <span className="text-xs text-muted-foreground font-mono">Java</span>
                          <Badge variant="outline" className="text-xs">Example {idx + 1}</Badge>
                        </div>
                        <ScrollArea className="h-auto max-h-64">
                          <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto">
                            <code>{example.code}</code>
                          </pre>
                        </ScrollArea>
                      </div>
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          <strong className="text-primary">Explanation:</strong> {example.explanation}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* NetBeans IDE Guidance */}
            {lesson.netBeansGuidance && lesson.netBeansGuidance.length > 0 && (
              <Card className="no-hover-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">NetBeans IDE Tips</CardTitle>
                  </div>
                  <CardDescription>How to practice this lesson in NetBeans</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lesson.netBeansGuidance.map((tip, idx) => (
                      <div key={idx} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-primary font-medium">{idx + 1}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/* Progress Card */}
            <Card className="no-hover-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Lesson Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isCompleted && (
                  <div>
                    <div className="flex items-center justify-between mb-2 text-xs">
                      <span className="text-muted-foreground">Reading</span>
                      <span className="font-medium">{Math.round(readProgress)}%</span>
                    </div>
                    <Progress value={readProgress} className="h-2" />
                  </div>
                )}

                <div className={!isCompleted ? "pt-3 border-t" : ""}>
                  <Button
                    className="w-full"
                    onClick={() => { if (!isCompleted && !progressIsLoading && !isRefreshingProgress) onComplete(); }}
                    disabled={isCompleted || progressIsLoading || isRefreshingProgress}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Complete Lesson
                      </>
                    )}
                  </Button>
                  {!isCompleted && (
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Earn {lesson.difficulty === 'Easy' ? '50' : lesson.difficulty === 'Intermediate' ? '75' : '100'} XP
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="no-hover-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Lesson Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Concepts</span>
                  <Badge variant="secondary" className="text-xs">{lesson.concepts.length}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Code Examples</span>
                  <Badge variant="secondary" className="text-xs">{lesson.codeExamples?.length || 0}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Difficulty</span>
                  <Badge variant="outline" className="text-xs">{lesson.difficulty}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-xs">{lesson.duration}</span>
                </div>
              </CardContent>
            </Card>

            {/* Study Tips */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm">Study Tips</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-muted-foreground">Read through each concept carefully</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-muted-foreground">Try the code examples in NetBeans</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-muted-foreground">Take notes on key concepts</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-muted-foreground">Practice makes perfect</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

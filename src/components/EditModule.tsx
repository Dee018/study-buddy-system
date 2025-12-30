import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { CurriculumManager } from '../utils/curriculumManager';
import ContentManager from '../utils/contentManager';
import { handleTabKey } from '../utils/codeEditorUtils';
import {
  ArrowLeft,
  Save,
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  Clock,
  ChevronRight,
  FileText,
  Sparkles,
  Code,
  Trophy,
  Eye,
  Settings as SettingsIcon,
  CheckCircle2,
  AlertCircle,
  Zap,
  Target,
  BookOpen,
  Lock,
  Globe
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  points: number;
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  instructions: string[];
  starterCode: string;
  expectedOutput?: string;
  hints: string[];
  points: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  requirements: string[];
  starterCode: string;
  expectedFeatures: string[];
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
}

interface Module {
  id: string;
  week: number;
  title: string;
  description: string;
  category: string;
  estimatedHours: number;
  lessons: Lesson[];
  exercises?: Exercise[];
  project?: Project;
  thumbnail?: string;
  published?: boolean;
  prerequisites?: string[];
  tags?: string[];
}

interface EditModuleProps {
  module: Module;
  onBack: () => void;
  onSave: (updatedModule: Module) => void;
}

type DialogType = 'lesson' | 'exercise' | 'project' | null;
type DeleteTarget = { type: 'lesson' | 'exercise' | 'project'; id: string; title: string } | null;

export function EditModule({ module, onBack, onSave }: EditModuleProps) {
  const [editedModule, setEditedModule] = useState<Module>(module);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [isSaving, setIsSaving] = useState(false);

  // Dialog states
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingLessonIndex, setEditingLessonIndex] = useState<number | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  // Drag and drop states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragType, setDragType] = useState<'lesson' | 'exercise' | null>(null);

  // Scroll to top when component loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Track changes
  useEffect(() => {
    const changed = JSON.stringify(editedModule) !== JSON.stringify(module);
    setHasChanges(changed);
  }, [editedModule, module]);

  // Helper function to get recommended XP based on module difficulty
  const getRecommendedXP = (moduleWeek: number): number => {
    if (moduleWeek <= 4) {
      // Beginner modules (1-4)
      return 75;
    } else if (moduleWeek <= 8) {
      // Intermediate modules (5-8)
      return 100;
    } else {
      // Advanced modules (9-12)
      return 125;
    }
  };

  const getModuleDifficulty = (moduleWeek: number): string => {
    if (moduleWeek <= 4) return 'Beginner';
    if (moduleWeek <= 8) return 'Intermediate';
    return 'Advanced';
  };

  // ==================== SAVE HANDLERS ====================

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Save to both managers for backward compatibility
      CurriculumManager.saveModule(editedModule.id, editedModule);

      // Save to ContentManager for comprehensive synchronization
      ContentManager.saveModule(editedModule.id, {
        ...(editedModule as any),
        handsOnExercises: (editedModule as any).exercises,
        assessmentProject: (editedModule as any).project
      } as any);

      // Show success toast with sync indicator
      toast.success('Module saved successfully', {
        description: '✓ All changes synchronized with Learning Hub',
        duration: 3000
      });

      // Call onSave callback
      onSave(editedModule);

      // Navigate back after short delay
      setTimeout(() => {
        onBack();
      }, 500);
    } catch (error) {
      toast.error('Failed to save module', {
        description: '⚠ Synchronization error - Please try again',
        duration: 3000
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== LESSON HANDLERS ====================

  const handleAddLesson = () => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: 'New Lesson',
      description: 'Lesson description',
      difficulty: 'Beginner',
      duration: '30 min',
      points: 100
    };

    setEditingLesson(newLesson);
    setEditingLessonIndex(editedModule.lessons.length);
    setDialogType('lesson');

    toast.info('Creating new lesson', {
      description: 'Fill in the lesson details below'
    });
  };

  const handleEditLesson = (lesson: Lesson, index: number) => {
    setEditingLesson({ ...lesson });
    setEditingLessonIndex(index);
    setDialogType('lesson');
  };

  const handleSaveLesson = () => {
    if (editingLesson && editingLessonIndex !== null) {
      const newLessons = [...editedModule.lessons];
      newLessons[editingLessonIndex] = editingLesson;

      setEditedModule({
        ...editedModule,
        lessons: newLessons
      });

      toast.success('Lesson saved', {
        description: `"${editingLesson.title}" has been updated`
      });

      setDialogType(null);
      setEditingLesson(null);
      setEditingLessonIndex(null);
    }
  };

  const handleDeleteLesson = (lesson: Lesson) => {
    setDeleteTarget({ type: 'lesson', id: lesson.id, title: lesson.title });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'lesson') {
      setEditedModule({
        ...editedModule,
        lessons: editedModule.lessons.filter(l => l.id !== deleteTarget.id)
      });

      toast.success('Lesson deleted', {
        description: `"${deleteTarget.title}" has been removed`
      });
    } else if (deleteTarget.type === 'exercise') {
      setEditedModule({
        ...editedModule,
        exercises: editedModule.exercises?.filter(e => e.id !== deleteTarget.id) || []
      });

      toast.success('Exercise deleted', {
        description: `"${deleteTarget.title}" has been removed`
      });
    } else if (deleteTarget.type === 'project') {
      setEditedModule({
        ...editedModule,
        project: undefined
      });

      toast.success('Project deleted', {
        description: `"${deleteTarget.title}" has been removed`
      });
    }

    setDeleteTarget(null);
  };

  // ==================== EXERCISE HANDLERS ====================

  const handleAddExercise = () => {
    const newExercise: Exercise = {
      id: `exercise-${Date.now()}`,
      title: 'New Exercise',
      description: 'Exercise description',
      difficulty: 'Easy',
      instructions: ['Complete the task'],
      starterCode: '// Write your code here',
      hints: ['Start by understanding the problem'],
      points: 50
    };

    setEditingExercise(newExercise);
    setEditingExerciseIndex((editedModule.exercises?.length || 0));
    setDialogType('exercise');

    toast.info('Creating new exercise', {
      description: 'Fill in the exercise details below'
    });
  };

  const handleEditExercise = (exercise: Exercise, index: number) => {
    setEditingExercise({ ...exercise });
    setEditingExerciseIndex(index);
    setDialogType('exercise');
  };

  const handleSaveExercise = () => {
    if (editingExercise && editingExerciseIndex !== null) {
      const newExercises = [...(editedModule.exercises || [])];
      newExercises[editingExerciseIndex] = editingExercise;

      setEditedModule({
        ...editedModule,
        exercises: newExercises
      });

      toast.success('Exercise saved', {
        description: `"${editingExercise.title}" has been updated`
      });

      setDialogType(null);
      setEditingExercise(null);
      setEditingExerciseIndex(null);
    }
  };

  const handleDeleteExercise = (exercise: Exercise) => {
    setDeleteTarget({ type: 'exercise', id: exercise.id, title: exercise.title });
  };

  // ==================== PROJECT HANDLERS ====================

  const handleAddOrEditProject = () => {
    const project = editedModule.project || {
      id: `project-${Date.now()}`,
      title: 'Module Project',
      description: 'Final project for this module',
      objectives: ['Demonstrate understanding'],
      requirements: ['Complete all lessons'],
      starterCode: '// Project starter code',
      expectedFeatures: ['Feature 1'],
      estimatedTime: '2 hours',
      difficulty: 'Medium' as const,
      points: 500
    };

    setEditingProject({ ...project });
    setDialogType('project');
  };

  const handleSaveProject = () => {
    if (editingProject) {
      setEditedModule({
        ...editedModule,
        project: editingProject
      });

      toast.success('Project saved', {
        description: `"${editingProject.title}" has been updated`
      });

      setDialogType(null);
      setEditingProject(null);
    }
  };

  const handleDeleteProject = () => {
    if (editedModule.project) {
      setDeleteTarget({ type: 'project', id: editedModule.project.id, title: editedModule.project.title });
    }
  };

  // ==================== DRAG AND DROP ====================

  const handleDragStart = (index: number, type: 'lesson' | 'exercise') => {
    setDraggedIndex(index);
    setDragType(type);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number, type: 'lesson' | 'exercise') => {
    e.preventDefault();
    if (draggedIndex === null || dragType !== type) return;

    if (type === 'lesson') {
      const newLessons = [...editedModule.lessons];
      const draggedLesson = newLessons[draggedIndex];
      newLessons.splice(draggedIndex, 1);
      newLessons.splice(dropIndex, 0, draggedLesson);

      setEditedModule({
        ...editedModule,
        lessons: newLessons
      });
    } else if (type === 'exercise' && editedModule.exercises) {
      const newExercises = [...editedModule.exercises];
      const draggedExercise = newExercises[draggedIndex];
      newExercises.splice(draggedIndex, 1);
      newExercises.splice(dropIndex, 0, draggedExercise);

      setEditedModule({
        ...editedModule,
        exercises: newExercises
      });
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
    setDragType(null);
  };

  // ==================== PREVIEW HANDLERS ====================

  const handlePreviewLesson = (lesson: Lesson) => {
    toast.info(`Previewing: ${lesson.title}`, {
      description: 'Preview feature coming soon'
    });
  };

  const handlePreviewExercise = (exercise: Exercise) => {
    toast.info(`Previewing: ${exercise.title}`, {
      description: 'Preview feature coming soon'
    });
  };

  const handlePreviewProject = () => {
    if (editedModule.project) {
      toast.info(`Previewing: ${editedModule.project.title}`, {
        description: 'Preview feature coming soon'
      });
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <button
              onClick={onBack}
              className="hover:text-primary transition-colors hover:underline"
            >
              Dashboard
            </button>
            <ChevronRight className="w-4 h-4" />
            <button
              onClick={onBack}
              className="hover:text-primary transition-colors hover:underline"
            >
              Content
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Edit Module</span>
          </div>

          {/* Title and Actions */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl">Edit Module</h1>
                <Badge
                  variant="outline"
                  className={`text-sm px-3 py-1 ${editedModule.category === 'Beginner' ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-400 dark:text-green-300' :
                    editedModule.category === 'Learner' ? 'bg-yellow-50 border-yellow-500 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-400 dark:text-yellow-300' :
                      'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900/20 dark:border-purple-400 dark:text-purple-300'
                    }`}
                >
                  {editedModule.category} Track • Week {editedModule.week}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Customize module content, lessons, exercises, and projects
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <Badge variant={editedModule.published ? "default" : "secondary"} className="h-8 px-3">
                {editedModule.published ? (
                  <><Globe className="w-3 h-3 mr-1" /> Published</>
                ) : (
                  <><Lock className="w-3 h-3 mr-1" /> Draft</>
                )}
              </Badge>

              {/* Sync Status Indicator */}
              <Badge
                variant="outline"
                className="h-8 px-3 border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20 dark:border-green-400 dark:text-green-300"
                title="Content synchronized with Learning Hub"
              >
                <Zap className="w-3 h-3 mr-1" /> Synced
              </Badge>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-muted p-1 rounded-lg">
            <TabsTrigger
              value="content"
              className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
            >
              <BookOpen className="w-4 h-4" />
              <span>Content</span>
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
            >
              <Code className="w-4 h-4" />
              <span>Activities</span>
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
            >
              <Trophy className="w-4 h-4" />
              <span>Projects</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* CONTENT TAB */}
          <TabsContent value="content" className="space-y-6">
            {/* Module Information */}
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <span>Module Information</span>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Basic module details and metadata
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Module Title */}
                  <div className="col-span-2">
                    <Label htmlFor="title">Module Title *</Label>
                    <Input
                      id="title"
                      value={editedModule.title}
                      onChange={(e) => setEditedModule({ ...editedModule, title: e.target.value })}
                      className="mt-2"
                      placeholder="e.g., Introduction to Java Programming"
                    />
                  </div>

                  {/* Module Description */}
                  <div className="col-span-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={editedModule.description}
                      onChange={(e) => setEditedModule({ ...editedModule, description: e.target.value })}
                      rows={4}
                      className="mt-2"
                      placeholder="Describe what students will learn in this module..."
                    />
                  </div>

                  {/* Difficulty Level */}
                  <div>
                    <Label htmlFor="category">Difficulty Level *</Label>
                    <Select
                      value={editedModule.category}
                      onValueChange={(value) => setEditedModule({ ...editedModule, category: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>Beginner</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Learner">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <span>Intermediate</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Advanced">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span>Advanced</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Estimated Hours */}
                  <div>
                    <Label htmlFor="hours">Estimated Hours *</Label>
                    <Input
                      id="hours"
                      type="number"
                      value={editedModule.estimatedHours}
                      onChange={(e) => setEditedModule({ ...editedModule, estimatedHours: parseInt(e.target.value) || 0 })}
                      className="mt-2"
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>



            {/* Lessons Section */}
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <span>Lessons</span>
                      <Badge variant="outline">{editedModule.lessons.length}</Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Manage lesson content and order
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleAddLesson}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lesson
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {editedModule.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      draggable
                      onDragStart={() => handleDragStart(index, 'lesson')}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index, 'lesson')}
                      className={`group p-4 border-2 rounded-lg cursor-move transition-all duration-200 ${dragOverIndex === index && dragType === 'lesson'
                        ? 'border-primary bg-primary/5 scale-[1.02] shadow-md'
                        : 'border-border hover:border-primary/50 hover:bg-muted/30'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {/* Drag Handle */}
                          <div className="mt-1 cursor-grab active:cursor-grabbing opacity-50 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="w-5 h-5 text-muted-foreground" />
                          </div>

                          {/* Lesson Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                Lesson {index + 1}
                              </Badge>
                              <h4 className="break-words">{lesson.title}</h4>
                              <Badge variant="outline">{lesson.difficulty}</Badge>
                              <Badge
                                variant="outline"
                                className="text-xs border-blue-400 text-blue-600 bg-blue-50"
                                title="Synchronized with Learning Hub"
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Live
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {lesson.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="leading-none">{lesson.duration}</span>
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="leading-none">{lesson.points} XP</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreviewLesson(lesson)}
                            className="opacity-0 group-hover:opacity-100 hover:bg-blue-500/10 hover:text-blue-600 active:scale-95 transition-all duration-200"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditLesson(lesson, index)}
                            className="hover:bg-primary/10 hover:text-primary active:scale-95 transition-all duration-200 group/edit"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 group-hover/edit:rotate-12 transition-transform" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLesson(lesson)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all duration-200"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {editedModule.lessons.length === 0 && (
                    <div className="text-center py-16 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
                      <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">No lessons yet</p>
                      <p className="text-xs text-muted-foreground/70 mb-4">
                        {editedModule.category === 'Learner'
                          ? 'Learner Track modules are ready for lesson content'
                          : editedModule.category === 'Advanced'
                            ? 'Advanced Track modules require comprehensive lesson content'
                            : 'Start building your module curriculum'}
                      </p>
                      <Button
                        onClick={handleAddLesson}
                        variant="outline"
                        className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Lesson
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ACTIVITIES TAB */}
          <TabsContent value="activities" className="space-y-6">
            {/* Exercises Section */}
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Code className="w-5 h-5 text-primary" />
                      <span>Hands-On Exercises</span>
                      <Badge variant="outline">{editedModule.exercises?.length || 0}</Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Coding challenges and practice exercises
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleAddExercise}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Exercise
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(editedModule.exercises || []).map((exercise, index) => (
                    <div
                      key={exercise.id}
                      draggable
                      onDragStart={() => handleDragStart(index, 'exercise')}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index, 'exercise')}
                      className={`group p-4 border-2 rounded-lg cursor-move transition-all duration-200 ${dragOverIndex === index && dragType === 'exercise'
                        ? 'border-primary bg-primary/5 scale-[1.02] shadow-md'
                        : 'border-border hover:border-primary/50 hover:bg-muted/30'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {/* Drag Handle */}
                          <div className="mt-1 cursor-grab active:cursor-grabbing opacity-50 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="w-5 h-5 text-muted-foreground" />
                          </div>

                          {/* Exercise Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                Exercise {index + 1}
                              </Badge>
                              <h4 className="break-words">{exercise.title}</h4>
                              <Badge
                                variant="outline"
                                className={
                                  exercise.difficulty === 'Easy' ? 'border-green-500 text-green-600' :
                                    exercise.difficulty === 'Medium' ? 'border-yellow-500 text-yellow-600' :
                                      'border-red-500 text-red-600'
                                }
                              >
                                {exercise.difficulty}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs border-blue-400 text-blue-600 bg-blue-50"
                                title="Synchronized with Learning Hub"
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Live
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {exercise.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Target className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="leading-none">{exercise.instructions.length} steps</span>
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="leading-none">{exercise.points} XP</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreviewExercise(exercise)}
                            className="opacity-0 group-hover:opacity-100 hover:bg-blue-500/10 hover:text-blue-600 active:scale-95 transition-all duration-200"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditExercise(exercise, index)}
                            className="hover:bg-primary/10 hover:text-primary active:scale-95 transition-all duration-200 group/edit"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 group-hover/edit:rotate-12 transition-transform" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExercise(exercise)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all duration-200"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!editedModule.exercises || editedModule.exercises.length === 0) && (
                    <div className="text-center py-16 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
                      <Code className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">No exercises yet</p>
                      <p className="text-xs text-muted-foreground/70 mb-4">
                        {editedModule.category === 'Learner'
                          ? 'Learner Track modules are ready for hands-on activities'
                          : editedModule.category === 'Advanced'
                            ? 'Advanced Track modules require complex coding challenges'
                            : 'Add coding challenges to reinforce learning'}
                      </p>
                      <Button
                        onClick={handleAddExercise}
                        variant="outline"
                        className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Exercise
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROJECTS TAB */}
          <TabsContent value="projects" className="space-y-6">
            {/* Module Project */}
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      <span>Module Project</span>
                      {editedModule.project && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Configured
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Final project to assess module completion
                    </CardDescription>
                  </div>
                  {!editedModule.project ? (
                    <Button
                      onClick={handleAddOrEditProject}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviewProject}
                        className="hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-600 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddOrEditProject}
                        className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteProject}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {editedModule.project ? (
                  <div className="p-6 border-2 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 space-y-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl">{editedModule.project.title}</h3>
                        <Badge
                          variant="outline"
                          className={
                            editedModule.project.difficulty === 'Easy' ? 'border-green-500 text-green-600' :
                              editedModule.project.difficulty === 'Medium' ? 'border-yellow-500 text-yellow-600' :
                                'border-red-500 text-red-600'
                          }
                        >
                          {editedModule.project.difficulty}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-blue-400 text-blue-600 bg-blue-50"
                          title="Synchronized with Learning Hub"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Live
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{editedModule.project.description}</p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Objectives</Label>
                        <ul className="mt-2 space-y-1">
                          {editedModule.project.objectives.map((obj, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-[2px] flex-shrink-0" />
                              <span className="leading-relaxed">{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Requirements</Label>
                        <ul className="mt-2 space-y-1">
                          {editedModule.project.requirements.map((req, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <Target className="w-4 h-4 text-primary mt-[2px] flex-shrink-0" />
                              <span className="leading-relaxed">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className="leading-none">{editedModule.project.estimatedTime}</span>
                        </span>
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Sparkles className="w-4 h-4 flex-shrink-0" />
                          <span className="leading-none">{editedModule.project.points} XP</span>
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {editedModule.project.expectedFeatures.length} Features
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/10">
                    <Trophy className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No module project configured</p>
                    <p className="text-sm text-muted-foreground/70 mb-4">
                      {editedModule.category === 'Learner'
                        ? 'Create an intermediate-level project to demonstrate learning'
                        : editedModule.category === 'Advanced'
                          ? 'Create a comprehensive advanced project integrating multiple concepts'
                          : 'Create a final project to demonstrate learning'}
                    </p>
                    <Button
                      onClick={handleAddOrEditProject}
                      variant="outline"
                      className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Module Project
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SettingsIcon className="w-5 h-5 text-primary" />
                  <span>Module Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure module visibility, prerequisites, and advanced options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Publication Settings */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-primary/20">
                    <Globe className="w-4 h-4 text-primary" />
                    <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Publication</h3>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                    <div className="space-y-1">
                      <Label htmlFor="published" className="text-base">Module Status</Label>
                      <p className="text-sm text-muted-foreground">
                        {editedModule.published ? 'Published - Visible to learners' : 'Draft - Only visible to admins'}
                      </p>
                    </div>
                    <Switch
                      id="published"
                      checked={editedModule.published || false}
                      onCheckedChange={(checked) => setEditedModule({ ...editedModule, published: checked })}
                    />
                  </div>
                </div>

                {/* Access Control */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-primary/20">
                    <Lock className="w-4 h-4 text-primary" />
                    <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Access Control</h3>
                  </div>

                  <div>
                    <Label>Prerequisites</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Requirements for accessing this module
                    </p>
                    {editedModule.week === 1 ? (
                      <div className="p-4 border rounded-lg bg-muted/10">
                        <p className="text-sm text-muted-foreground">
                          No prerequisites - This is the first module
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 border rounded-lg bg-muted/10">
                        <p className="text-sm">
                          <strong>Required:</strong> Module {editedModule.week - 1} must be completed at 100%
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Learners cannot access this module until they finish the previous one.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom Action Bar */}
        <Card className="border-2 border-primary/20 shadow-xl sticky bottom-4 bg-background/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="hover:bg-muted transition-colors"
                  disabled={isSaving}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>

                {hasChanges && (
                  <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-600">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Unsaved Changes
                  </Badge>
                )}
              </div>

              <Button
                onClick={handleSave}
                size="lg"
                disabled={!hasChanges || isSaving}
                className="min-w-[200px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save All Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==================== DIALOGS ==================== */}

      {/* Edit Lesson Dialog */}
      <Dialog open={dialogType === 'lesson'} onOpenChange={(open) => !open && setDialogType(null)}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl">
                  {editingLessonIndex !== null && editingLessonIndex < editedModule.lessons.length ? 'Edit Lesson' : 'Create New Lesson'}
                </DialogTitle>
                <DialogDescription>
                  Configure lesson content, difficulty, and reward settings
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-primary/20">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Basic Information</h3>
              </div>

              <div>
                <Label htmlFor="lesson-title">Lesson Title *</Label>
                <Input
                  id="lesson-title"
                  value={editingLesson?.title || ''}
                  onChange={(e) => setEditingLesson({ ...editingLesson!, title: e.target.value })}
                  className="mt-2"
                  placeholder="e.g., Introduction to Variables"
                />
              </div>

              <div>
                <Label htmlFor="lesson-description">Description *</Label>
                <Textarea
                  id="lesson-description"
                  value={editingLesson?.description || ''}
                  onChange={(e) => setEditingLesson({ ...editingLesson!, description: e.target.value })}
                  rows={4}
                  className="mt-2"
                  placeholder="Describe what students will learn in this lesson..."
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Lesson Settings</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lesson-difficulty">Difficulty Level</Label>
                  <Select
                    value={editingLesson?.difficulty || 'Beginner'}
                    onValueChange={(value) => setEditingLesson({ ...editingLesson!, difficulty: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span>Beginner</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Learner">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <span>Intermediate</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Advanced">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span>Advanced</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="lesson-duration">Estimated Duration</Label>
                  <Input
                    id="lesson-duration"
                    value={editingLesson?.duration || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson!, duration: e.target.value })}
                    className="mt-2"
                    placeholder="e.g., 30 min"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="lesson-points">Experience Points (XP)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="lesson-points"
                      type="number"
                      value={editingLesson?.points || 0}
                      onChange={(e) => setEditingLesson({ ...editingLesson!, points: parseInt(e.target.value) || 0 })}
                      placeholder="100"
                      min="0"
                      step="10"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingLesson({ ...editingLesson!, points: getRecommendedXP(editedModule.week) })}
                      className="whitespace-nowrap"
                    >
                      Use Recommended ({getRecommendedXP(editedModule.week)} XP)
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended for {getModuleDifficulty(editedModule.week)} module (Week {editedModule.week})
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDialogType(null)}
              className="transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveLesson}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Exercise Dialog */}
      <Dialog open={dialogType === 'exercise'} onOpenChange={(open) => !open && setDialogType(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                <Code className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl">
                  {editingExerciseIndex !== null && (editedModule.exercises?.length || 0) > editingExerciseIndex ? 'Edit Exercise' : 'Create New Exercise'}
                </DialogTitle>
                <DialogDescription>
                  Configure coding challenge and starter code
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-primary/20">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Basic Information</h3>
                </div>

                <div>
                  <Label htmlFor="exercise-title">Exercise Title *</Label>
                  <Input
                    id="exercise-title"
                    value={editingExercise?.title || ''}
                    onChange={(e) => setEditingExercise({ ...editingExercise!, title: e.target.value })}
                    className="mt-2"
                    placeholder="e.g., Create a Simple Calculator"
                  />
                </div>

                <div>
                  <Label htmlFor="exercise-description">Description *</Label>
                  <Textarea
                    id="exercise-description"
                    value={editingExercise?.description || ''}
                    onChange={(e) => setEditingExercise({ ...editingExercise!, description: e.target.value })}
                    rows={3}
                    className="mt-2"
                    placeholder="What should students accomplish in this exercise?"
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-primary/20">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Exercise Settings</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="exercise-difficulty">Difficulty</Label>
                    <Select
                      value={editingExercise?.difficulty || 'Easy'}
                      onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => setEditingExercise({ ...editingExercise!, difficulty: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="exercise-points">XP Reward</Label>
                    <Input
                      id="exercise-points"
                      type="number"
                      value={editingExercise?.points || 0}
                      onChange={(e) => setEditingExercise({ ...editingExercise!, points: parseInt(e.target.value) || 0 })}
                      className="mt-2"
                      min="0"
                      step="10"
                    />
                  </div>
                </div>
              </div>

              {/* Code */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-primary/20">
                  <Code className="w-4 h-4 text-primary" />
                  <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Starter Code</h3>
                </div>

                <div>
                  <Label htmlFor="exercise-starter-code">Starter Code</Label>
                  <Textarea
                    id="exercise-starter-code"
                    value={editingExercise?.starterCode || ''}
                    onChange={(e) => setEditingExercise({ ...editingExercise!, starterCode: e.target.value })}
                    onKeyDown={handleTabKey}
                    rows={6}
                    className="mt-2 font-mono text-sm"
                    placeholder="// Starter code for students"
                    spellCheck={false}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ⌨️ Tab/Shift+Tab for indent/outdent
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDialogType(null)}
              className="transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveExercise}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Exercise
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={dialogType === 'project'} onOpenChange={(open) => !open && setDialogType(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl">
                  {editedModule.project ? 'Edit Module Project' : 'Create Module Project'}
                </DialogTitle>
                <DialogDescription>
                  Configure the final project for this module
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-primary/20">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Project Information</h3>
                </div>

                <div>
                  <Label htmlFor="project-title">Project Title *</Label>
                  <Input
                    id="project-title"
                    value={editingProject?.title || ''}
                    onChange={(e) => setEditingProject({ ...editingProject!, title: e.target.value })}
                    className="mt-2"
                    placeholder="e.g., Build a Student Management System"
                  />
                </div>

                <div>
                  <Label htmlFor="project-description">Description *</Label>
                  <Textarea
                    id="project-description"
                    value={editingProject?.description || ''}
                    onChange={(e) => setEditingProject({ ...editingProject!, description: e.target.value })}
                    rows={4}
                    className="mt-2"
                    placeholder="Describe the project requirements and objectives..."
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-primary/20">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Project Settings</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="project-difficulty">Difficulty</Label>
                    <Select
                      value={editingProject?.difficulty || 'Medium'}
                      onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => setEditingProject({ ...editingProject!, difficulty: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="project-time">Estimated Time</Label>
                    <Input
                      id="project-time"
                      value={editingProject?.estimatedTime || ''}
                      onChange={(e) => setEditingProject({ ...editingProject!, estimatedTime: e.target.value })}
                      className="mt-2"
                      placeholder="e.g., 2 hours"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="project-points">XP Reward</Label>
                    <Input
                      id="project-points"
                      type="number"
                      value={editingProject?.points || 0}
                      onChange={(e) => setEditingProject({ ...editingProject!, points: parseInt(e.target.value) || 0 })}
                      className="mt-2"
                      min="0"
                      step="50"
                    />
                  </div>
                </div>
              </div>

              {/* Code */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-primary/20">
                  <Code className="w-4 h-4 text-primary" />
                  <h3 className="text-sm uppercase tracking-wide text-muted-foreground">Starter Code</h3>
                </div>

                <div>
                  <Label htmlFor="project-starter-code">Starter Code</Label>
                  <Textarea
                    id="project-starter-code"
                    value={editingProject?.starterCode || ''}
                    onChange={(e) => setEditingProject({ ...editingProject!, starterCode: e.target.value })}
                    onKeyDown={handleTabKey}
                    rows={6}
                    className="mt-2 font-mono text-sm"
                    placeholder="// Project starter code"
                    spellCheck={false}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ⌨️ Tab/Shift+Tab for indent/outdent
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDialogType(null)}
              className="transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProject}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <span>Confirm Deletion</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">"{deleteTarget?.title}"</span>?
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="transition-colors">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

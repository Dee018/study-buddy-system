import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Bug,
  Lightbulb,
  HelpCircle,
  MessageSquare,
  ArrowLeft,
  CheckCircle,
  Send,
  AlertCircle,
  Sparkles,
  BookOpen,
  Star,
  Heart,
  Smile,
  Meh,
  Frown,
  ThumbsUp,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { StudyBuddyLogo } from './StudyBuddyLogo';
import { IssueReportManager, IssueType } from '../utils/issueReportManager';

interface ReportIssueProps {
  onNavigate: (screen: string) => void;
  userData: {
    id: string;
    username: string;
  };
}

interface IssueTypeOption {
  id: IssueType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

export function ReportIssue({ onNavigate, userData }: ReportIssueProps) {
  const [selectedType, setSelectedType] = useState<IssueType | null>(null);
  const [subject, setSubject] = useState('');
  const [bugCategory, setBugCategory] = useState('');
  const [helpCategory, setHelpCategory] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ subject?: string; description?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Feedback-specific states
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackSentiment, setFeedbackSentiment] = useState('');
  const [feedbackCategories, setFeedbackCategories] = useState<string[]>([]);

  // Screenshot upload state
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotError, setScreenshotError] = useState<string>('');

  const bugCategories = [
    'Login/Authentication Issues',
    'Module Loading Problems',
    'Exercise/Assessment Errors',
    'Progress Not Saving',
    'UI/Display Issues',
    'Performance Problems',
    'AI Assistant Not Responding',
    'Copy/Paste Prevention Issues',
    'Theme/Dark Mode Issues',
    'Navigation/Routing Problems',
    'Other Technical Issues'
  ];

  const helpCategories = [
    'Getting Started with Java',
    'Understanding a Concept',
    'Module/Lesson Navigation',
    'Code Exercise Help',
    'Project Assistance',
    'AI Assistant Not Working',
    'Account/Profile Issues',
    'Technical Difficulties',
    'Other Questions'
  ];

  const feedbackCategoryOptions = [
    '📚 Content Quality',
    '🎨 Design & UI',
    '⚡ Performance',
    '✨ Features',
    '🎯 User Experience',
    '💬 Other'
  ];

  const issueTypes: IssueTypeOption[] = [
    {
      id: 'bug',
      label: 'Bug Report',
      description: 'Report a technical issue or error',
      icon: <Bug className="w-6 h-6" />,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-500/10 dark:bg-red-500/20',
      borderColor: 'border-red-500/30 dark:border-red-500/40'
    },
    {
      id: 'feature',
      label: 'Feature Request',
      description: 'Suggest a new feature or improvement',
      icon: <Lightbulb className="w-6 h-6" />,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-500/10 dark:bg-yellow-500/20',
      borderColor: 'border-yellow-500/30 dark:border-yellow-500/40'
    },
    {
      id: 'help',
      label: 'Help Request',
      description: 'Get help with using the platform',
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
      borderColor: 'border-blue-500/30 dark:border-blue-500/40'
    },
    {
      id: 'feedback',
      label: 'General Feedback',
      description: 'Share your thoughts and suggestions',
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
      borderColor: 'border-purple-500/30 dark:border-purple-500/40'
    }
  ];

  // Defensive helper: if the currently focused element is inside an element
  // with aria-hidden="true", blur it to avoid the browser blocking the
  // change when libraries attempt to toggle aria-hidden at runtime.
  const ensureFocusedElementNotHidden = () => {
    try {
      const active = document.activeElement as HTMLElement | null;
      if (!active) return;
      let el: HTMLElement | null = active;
      while (el) {
        if (el.getAttribute && el.getAttribute('aria-hidden') === 'true') {
          active.blur();
          return;
        }
        el = el.parentElement;
      }
    } catch (e) {
      // ignore in SSR or restricted environments
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { subject?: string; description?: string } = {};

    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (subject.length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!selectedType) return;

    // For general feedback type, use the user_feedback table and different validation
    if (selectedType === 'feedback') {
      setIsSubmitting(true);
      try {
        const feedbackType = 'overall';
        const itemId = feedbackCategories.length ? feedbackCategories.join('|') : null;
        const rating = feedbackRating > 0 ? feedbackRating : null;
        const comment = description || null;

        await IssueReportManager.submitFeedback(
          userData.id,
          feedbackType,
          itemId,
          rating,
          comment,
          null
        );

        setIsSuccess(true);
      } catch (error) {
        console.error('Error submitting feedback:', error);
        setErrors({ description: 'Failed to submit feedback. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Submit the report with screenshot if available
      await IssueReportManager.submitReport(
        userData.id,
        userData.username,
        selectedType,
        subject,
        description,
        screenshot || undefined
      );

      // Show success
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting report:', error);
      setErrors({ description: 'Failed to submit report. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setScreenshotError('Please upload an image file (PNG, JPG, JPEG)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setScreenshotError('Image size must be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setScreenshot(result);
      setScreenshotError('');
    };
    reader.onerror = () => {
      setScreenshotError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setScreenshot(null);
    setScreenshotError('');
  };

  const handleReset = () => {
    setSelectedType(null);
    setSubject('');
    setBugCategory('');
    setHelpCategory('');
    setDescription('');
    setFeedbackRating(0);
    setFeedbackSentiment('');
    setFeedbackCategories([]);
    setScreenshot(null);
    setScreenshotError('');
    setErrors({});
    setIsSuccess(false);
  };

  const getTypeOption = (type: IssueType) => {
    return issueTypes.find(t => t.id === type);
  };

  // Success Screen
  if (isSuccess) {
    const typeOption = selectedType ? getTypeOption(selectedType) : null;

    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <StudyBuddyLogo size="2xl" variant="minimal" withBackground={false} />
              <div>
                <h1 className="text-2xl">Report Issue</h1>
                <p className="text-sm text-muted-foreground">Help us improve your experience</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => onNavigate('learning')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Learning
            </Button>
          </div>

          {/* Success Card */}
          <Card className="border-green-500/30 dark:border-green-500/40">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>

              <h2 className="text-2xl mb-3">Report Submitted Successfully!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for your {typeOption?.label.toLowerCase()}. We've received your feedback and will review it shortly.
              </p>

              {/* Report Summary */}
              <div className="bg-muted/50 rounded-lg p-4 mb-8 text-left">
                <div className="flex items-start space-x-3 mb-3">
                  <div className={typeOption?.color || ''}>
                    {typeOption?.icon}
                  </div>
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">
                      {typeOption?.label}
                    </Badge>
                    <h3 className="mb-1">{subject}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleReset} variant="outline">
                  Submit Another Report
                </Button>
                <Button onClick={() => onNavigate('learning')}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Continue Learning
                </Button>
              </div>

              {/* Quick Help */}
              <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm">Need immediate help?</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Try our AI Assistant for instant answers to your questions
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('learning')}
                >
                  Open AI Assistant
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}


        {/* Step 1: Select Issue Type */}
        {!selectedType ? (
          <div>
            <div className="mb-6">
              <h2 className="text-xl mb-2">What can we help you with?</h2>
              <p className="text-muted-foreground">Select the type of issue you'd like to report</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {issueTypes.map((type) => (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all hover:scale-105 ${type.borderColor} border-2`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${type.bgColor} ${type.color}`}>
                        {type.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-1">{type.label}</h3>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Step 2: Report Form
          <div>
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => setSelectedType(null)}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Change Issue Type
              </Button>

              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${getTypeOption(selectedType)?.bgColor || ''} ${getTypeOption(selectedType)?.color || ''}`}>
                  {getTypeOption(selectedType)?.icon}
                </div>
                <div>
                  <h2 className="text-xl">{getTypeOption(selectedType)?.label}</h2>
                  <p className="text-sm text-muted-foreground">{getTypeOption(selectedType)?.description}</p>
                </div>
              </div>
            </div>

            {selectedType === 'feedback' ? (
              /* Feedback-specific interface */
              <Card className="border-purple-500/30 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <CardTitle>Share Your Feedback</CardTitle>
                  </div>
                  <CardDescription>
                    We'd love to hear what you think! Your feedback helps us make Study Buddy better.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Rating Section */}
                  <div className="space-y-3">
                    <Label className="text-base">How would you rate your experience?</Label>
                    <div className="flex items-center justify-center space-x-2 py-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="transition-all duration-200 hover:scale-110"
                        >
                          <Star
                            className={`w-10 h-10 ${star <= feedbackRating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sentiment Section */}
                  <div className="space-y-3">
                    <Label className="text-base">What's your overall feeling?</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { value: 'love', label: 'Love it!', icon: Heart, color: 'pink' },
                        { value: 'good', label: 'Good', icon: Smile, color: 'green' },
                        { value: 'okay', label: 'Okay', icon: Meh, color: 'blue' },
                        { value: 'needs-work', label: 'Needs Work', icon: Frown, color: 'orange' }
                      ].map((sentiment) => {
                        const Icon = sentiment.icon;
                        const isSelected = feedbackSentiment === sentiment.value;
                        return (
                          <Button
                            key={sentiment.value}
                            type="button"
                            variant={isSelected ? 'default' : 'outline'}
                            onClick={() => setFeedbackSentiment(sentiment.value)}
                            className={`h-auto py-3 flex-col space-y-1 ${isSelected
                              ? sentiment.color === 'pink'
                                ? 'bg-pink-500 hover:bg-pink-600'
                                : sentiment.color === 'green'
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : sentiment.color === 'blue'
                                    ? 'bg-blue-500 hover:bg-blue-600'
                                    : 'bg-orange-500 hover:bg-orange-600'
                              : ''
                              }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs">{sentiment.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category Tags */}
                  <div className="space-y-3">
                    <Label className="text-base">What's this feedback about? (Select all that apply)</Label>
                    <div className="flex flex-wrap gap-2">
                      {feedbackCategoryOptions.map((category) => {
                        const isSelected = feedbackCategories.includes(category);
                        return (
                          <Badge
                            key={category}
                            variant={isSelected ? 'default' : 'outline'}
                            className={`cursor-pointer px-3 py-1.5 text-sm transition-all ${isSelected
                              ? 'bg-primary hover:bg-primary/90'
                              : 'hover:bg-primary/10'
                              }`}
                            onClick={() => {
                              if (isSelected) {
                                setFeedbackCategories(feedbackCategories.filter(c => c !== category));
                              } else {
                                setFeedbackCategories([...feedbackCategories, category]);
                              }
                            }}
                          >
                            {category}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comment Box */}
                  <div className="space-y-2">
                    <Label htmlFor="feedback-comment" className="text-base">
                      Tell us more (Optional)
                    </Label>
                    <Textarea
                      id="feedback-comment"
                      placeholder="Share your thoughts, ideas, or suggestions... We're all ears! 👂"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setSubject(`Feedback: ${feedbackSentiment || 'General'} - ${feedbackRating} stars`);
                      }}
                      rows={6}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {description.length} / 1000 characters
                    </p>
                  </div>

                  {/* Friendly Note */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <ThumbsUp className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm">
                          Thanks for taking the time to share your thoughts! Every piece of feedback helps us create a better learning experience for everyone. 💜
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => onNavigate('learning')}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isSubmitting ? (
                        <>Submitting...</>
                      ) : (
                        <>
                          <Heart className="w-4 h-4 mr-2" />
                          Share Feedback
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Standard interface for bug, feature, and help */
              <Card>
                <CardHeader>
                  <CardTitle>Report Details</CardTitle>
                  <CardDescription>
                    Please provide as much detail as possible to help us address your issue
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Subject Field */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      Subject <span className="text-red-500">*</span>
                    </Label>
                    {selectedType === 'bug' ? (
                      <Select
                        value={bugCategory}
                        onValueChange={(value) => {
                          setBugCategory(value);
                          setSubject(value);
                          if (errors.subject) setErrors({ ...errors, subject: undefined });
                        }}
                        onOpenChange={(open) => {
                          if (open) setTimeout(ensureFocusedElementNotHidden, 0);
                        }}
                      >
                        <SelectTrigger
                          id="subject"
                          className={errors.subject ? 'border-red-500' : ''}
                        >
                          <SelectValue placeholder="Select the type of bug you're experiencing" />
                        </SelectTrigger>
                        <SelectContent>
                          {bugCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : selectedType === 'help' ? (
                      <Select
                        value={helpCategory}
                        onValueChange={(value) => {
                          setHelpCategory(value);
                          setSubject(value);
                          if (errors.subject) setErrors({ ...errors, subject: undefined });
                        }}
                        onOpenChange={(open) => {
                          if (open) setTimeout(ensureFocusedElementNotHidden, 0);
                        }}
                      >
                        <SelectTrigger
                          id="subject"
                          className={errors.subject ? 'border-red-500' : ''}
                        >
                          <SelectValue placeholder="What do you need help with?" />
                        </SelectTrigger>
                        <SelectContent>
                          {helpCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="subject"
                        placeholder="Brief summary of your request"
                        value={subject}
                        onChange={(e) => {
                          setSubject(e.target.value);
                          if (errors.subject) setErrors({ ...errors, subject: undefined });
                        }}
                        className={errors.subject ? 'border-red-500' : ''}
                      />
                    )}
                    {errors.subject && (
                      <p className="text-sm text-red-500 flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.subject}</span>
                      </p>
                    )}
                  </div>

                  {/* Description Field */}
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder={
                        selectedType === 'bug'
                          ? 'Please describe the bug in detail. What were you doing when it occurred? What did you expect to happen?'
                          : selectedType === 'feature'
                            ? 'Describe the feature you\'d like to see and how it would improve your experience'
                            : 'Describe what you need help with and what you\'ve tried so far'
                      }
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (errors.description) setErrors({ ...errors, description: undefined });
                      }}
                      rows={8}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    <div className="flex justify-between items-center">
                      <div>
                        {errors.description && (
                          <p className="text-sm text-red-500 flex items-center space-x-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{errors.description}</span>
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {description.length} / 1000 characters
                      </p>
                    </div>
                  </div>

                  {/* Screenshot Upload - Only for Bug and Help */}
                  {(selectedType === 'bug' || selectedType === 'help') && (
                    <div className="space-y-2">
                      <Label htmlFor="screenshot">
                        Screenshot (Optional)
                      </Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Upload a screenshot to help us better understand the issue
                      </p>

                      {!screenshot ? (
                        <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                          <label
                            htmlFor="screenshot-upload"
                            className="cursor-pointer flex flex-col items-center space-y-2"
                          >
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Upload className="w-6 h-6 text-primary" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm">
                                <span className="text-primary hover:underline">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                PNG, JPG, JPEG (max 5MB)
                              </p>
                            </div>
                            <input
                              id="screenshot-upload"
                              type="file"
                              accept="image/png,image/jpeg,image/jpg"
                              onChange={handleScreenshotUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      ) : (
                        <div className="border border-border rounded-lg p-4 bg-muted/30">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <ImageIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm mb-2">Screenshot attached</p>
                              <div className="relative group">
                                <img
                                  src={screenshot}
                                  alt="Screenshot preview"
                                  className="w-full max-h-48 object-contain rounded border border-border"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                  <p className="text-white text-sm">Preview</p>
                                </div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveScreenshot}
                              className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {screenshotError && (
                        <p className="text-sm text-red-500 flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{screenshotError}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Tips */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm mb-2">Tips for a helpful report:</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {selectedType === 'bug' && (
                            <>
                              <li>• Describe what you were doing when the issue occurred</li>
                              <li>• Include any error messages you saw</li>
                              <li>• Mention if you can reproduce the issue consistently</li>
                            </>
                          )}
                          {selectedType === 'feature' && (
                            <>
                              <li>• Explain the problem this feature would solve</li>
                              <li>• Describe how you envision it working</li>
                              <li>• Share any similar features you've seen elsewhere</li>
                            </>
                          )}
                          {selectedType === 'help' && (
                            <>
                              <li>• Describe what you're trying to accomplish</li>
                              <li>• Share what you've already tried</li>
                              <li>• Include any specific error messages or issues</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => onNavigate('learning')}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>Submitting...</>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Report
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

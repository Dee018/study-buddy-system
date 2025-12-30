/**
 * CompletionBadge Component
 * 
 * Visual indicator for completion, in-progress, and locked states
 * Provides consistent UI across Learning Hub, Progress Tracker, Profile, and Admin
 */

import React from 'react';
import { Badge } from './ui/badge';
import { CheckCircle, Lock, TrendingUp, Circle } from 'lucide-react';
import { cn } from './ui/utils';

export type CompletionStatus = 'completed' | 'in-progress' | 'locked' | 'not-started';

interface CompletionBadgeProps {
  status: CompletionStatus;
  percentage?: number;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

export function CompletionBadge({
  status,
  percentage = 0,
  size = 'md',
  showPercentage = false,
  className
}: CompletionBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  switch (status) {
    case 'completed':
      return (
        <Badge
          variant="default"
          className={cn(
            'bg-green-600 hover:bg-green-600 text-white border-green-700',
            sizeClasses[size],
            className
          )}
        >
          <CheckCircle className={cn(iconSizes[size], 'mr-1')} />
          Completed
          {showPercentage && percentage >= 100 && ' (100%)'}
        </Badge>
      );

    case 'in-progress':
      return (
        <Badge
          variant="default"
          className={cn(
            'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white',
            sizeClasses[size],
            className
          )}
        >
          <TrendingUp className={cn(iconSizes[size], 'mr-1')} />
          In Progress
          {showPercentage && percentage > 0 && ` (${percentage}%)`}
        </Badge>
      );

    case 'locked':
      return (
        <Badge
          variant="outline"
          className={cn(
            'bg-muted text-muted-foreground border-muted-foreground/20',
            sizeClasses[size],
            className
          )}
        >
          <Lock className={cn(iconSizes[size], 'mr-1')} />
          Locked
        </Badge>
      );

    case 'not-started':
    default:
      return (
        <Badge
          variant="outline"
          className={cn(
            'bg-background text-muted-foreground',
            sizeClasses[size],
            className
          )}
        >
          <Circle className={cn(iconSizes[size], 'mr-1')} />
          Not Started
        </Badge>
      );
  }
}

/**
 * Inline completion indicator (for compact displays)
 */
interface CompletionIndicatorProps {
  status: CompletionStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CompletionIndicator({
  status,
  size = 'md',
  className
}: CompletionIndicatorProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  switch (status) {
    case 'completed':
      return (
        <div className={cn('relative', className)}>
          <CheckCircle className={cn(sizeClasses[size], 'text-green-600')} />
        </div>
      );

    case 'in-progress':
      return (
        <div className={cn('relative', className)}>
          <TrendingUp className={cn(sizeClasses[size], 'text-purple-500')} />
        </div>
      );

    case 'locked':
      return (
        <div className={cn('relative', className)}>
          <Lock className={cn(sizeClasses[size], 'text-muted-foreground')} />
        </div>
      );

    case 'not-started':
    default:
      return (
        <div className={cn('relative', className)}>
          <Circle className={cn(sizeClasses[size], 'text-muted-foreground')} />
        </div>
      );
  }
}

/**
 * Progress ring indicator (for visual progress display)
 */
interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  status: CompletionStatus;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressRing({
  percentage,
  size = 60,
  strokeWidth = 4,
  status,
  showPercentage = true,
  className
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in-progress':
        return 'text-purple-500';
      case 'locked':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn('transition-all duration-500', getColor())}
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-xs font-medium', getColor())}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Determine completion status based on progress data
 */
export function getCompletionStatus(
  isCompleted: boolean,
  completionPercentage: number,
  isUnlocked: boolean
): CompletionStatus {
  if (isCompleted) return 'completed';
  if (!isUnlocked) return 'locked';
  if (completionPercentage > 0) return 'in-progress';
  return 'not-started';
}

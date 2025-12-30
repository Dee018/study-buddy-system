import React from 'react';
import { Star, Trophy, Zap, Crown, Flame } from 'lucide-react';

interface XPBarProps {
  current: number;
  max: number;
  className?: string;
}

export function XPBar({ current, max, className = '' }: XPBarProps) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className={`relative ${className}`}>
      <div className="h-8 bg-secondary/50 rounded-full overflow-hidden border-2 border-primary/20 shadow-inner">
        <div
          className="h-full gradient-bg relative transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white drop-shadow-lg">
          {current} / {max} XP
        </span>
      </div>
    </div>
  );
}

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  className = ''
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-secondary/50"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7A42F4" />
            <stop offset="50%" stopColor="#9D6BFF" />
            <stop offset="100%" stopColor="#FFD24C" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold gradient-bg bg-clip-text text-transparent">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

interface LevelBadgeProps {
  level: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function LevelBadge({ level, size = 'md', animate = false }: LevelBadgeProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-24 h-24 text-lg'
  };

  const icon = level === 'Beginner' ? '🌱' : level === 'Learner' ? '🚀' : '👑';

  return (
    <div className={`relative ${animate ? 'float-animate' : ''}`}>
      <div className={`${sizeClasses[size]} level-badge rounded-full flex items-center justify-center ${animate ? 'pulse-glow' : ''}`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        <span className="text-xs font-bold bg-card px-2 py-0.5 rounded-full border-2 border-primary shadow-md">
          {level}
        </span>
      </div>
    </div>
  );
}

interface CoinProps {
  count: number;
  animate?: boolean;
}

export function Coins({ count, animate = false }: CoinProps) {
  return (
    <div className={`inline-flex items-center gap-2 ${animate ? 'bounce-animate' : ''}`}>
      <div className="w-8 h-8 gradient-bg-gold rounded-full flex items-center justify-center shadow-lg glow-gold">
        <span className="text-base">💰</span>
      </div>
      <span className="font-bold text-lg">{count.toLocaleString()}</span>
    </div>
  );
}

interface StreakBadgeProps {
  days: number;
  animate?: boolean;
}

export function StreakBadge({ days, animate = false }: StreakBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 gradient-bg-gold rounded-full shadow-lg ${animate ? 'fire-animate' : ''}`}>
      <Flame className="w-5 h-5 text-white" />
      <span className="font-bold text-white text-sm">{days} Day Streak!</span>
      <Flame className="w-5 h-5 text-white" />
    </div>
  );
}

interface AchievementBadgeProps {
  icon: React.ReactNode;
  title: string;
  unlocked?: boolean;
}

export function AchievementBadge({ icon, title, unlocked = false }: AchievementBadgeProps) {
  return (
    <div className={`achievement-card p-4 ${unlocked ? '' : 'opacity-40 grayscale'}`}>
      <div className="flex flex-col items-center gap-2">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${unlocked ? 'gradient-bg-gold glow-gold' : 'bg-secondary'}`}>
          {icon}
        </div>
        <p className="text-xs font-semibold text-center">{title}</p>
      </div>
    </div>
  );
}

interface MascotProps {
  type: 'celebration' | 'learning' | 'thinking' | 'success';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function Mascot({ type, size = 'md', animate = true }: MascotProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-4xl',
    md: 'w-24 h-24 text-6xl',
    lg: 'w-32 h-32 text-8xl'
  };

  const mascots = {
    celebration: '🎉',
    learning: '📚',
    thinking: '🤔',
    success: '⭐'
  };

  return (
    <div className={`${sizeClasses[size]} ${animate ? 'float-animate' : ''} relative`}>
      <div className="w-full h-full gradient-bg rounded-full flex items-center justify-center shadow-2xl glow-purple">
        <span>{mascots[type]}</span>
      </div>
      {animate && (
        <>
          <div className="particle absolute top-0 left-0 w-2 h-2 gradient-bg-gold rounded-full" />
          <div className="particle absolute top-0 right-0 w-2 h-2 gradient-bg-mint rounded-full" style={{ animationDelay: '1s' }} />
          <div className="particle absolute bottom-0 left-0 w-2 h-2 gradient-bg rounded-full" style={{ animationDelay: '2s' }} />
          <div className="particle absolute bottom-0 right-0 w-2 h-2 gradient-bg-gold rounded-full" style={{ animationDelay: '3s' }} />
        </>
      )}
    </div>
  );
}

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function StarRating({ rating, maxRating = 5, size = 'md', animate = false }: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex gap-1">
      {Array.from({ length: maxRating }).map((_, i) => (
        <Star
          key={i}
          className={`${sizeClasses[size]} ${i < rating ? 'fill-[#FFD24C] text-[#FFD24C]' : 'text-gray-300'} ${animate && i < rating ? 'star-pop' : ''}`}
          style={animate ? { animationDelay: `${i * 0.1}s` } : {}}
        />
      ))}
    </div>
  );
}

interface QuickStatsProps {
  xp: number;
  level: string;
  streak: number;
  completed: number;
}

export function QuickStats({ xp, level, streak, completed }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="game-card p-4 text-center">
        <Zap className="w-8 h-8 mx-auto mb-2 text-primary" />
        <p className="text-2xl font-bold gradient-bg bg-clip-text text-transparent">{xp.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">Total XP</p>
      </div>

      <div className="game-card p-4 text-center">
        <Crown className="w-8 h-8 mx-auto mb-2 text-[#FFD24C]" />
        <p className="text-2xl font-bold">{level}</p>
        <p className="text-xs text-muted-foreground">Level</p>
      </div>

      <div className="game-card p-4 text-center">
        <Flame className="w-8 h-8 mx-auto mb-2 text-[#FFD24C]" />
        <p className="text-2xl font-bold">{streak}</p>
        <p className="text-xs text-muted-foreground">Day Streak</p>
      </div>

      <div className="game-card p-4 text-center">
        <Trophy className="w-8 h-8 mx-auto mb-2 text-[#3DDC84]" />
        <p className="text-2xl font-bold">{completed}</p>
        <p className="text-xs text-muted-foreground">Completed</p>
      </div>
    </div>
  );
}

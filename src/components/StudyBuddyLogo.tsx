import React from 'react';
import studyBuddyLogo from '../assets/latestlogo-removebg-preview.png';

interface StudyBuddyLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  variant?: 'default' | 'bordered' | 'elevated' | 'minimal' | 'glow' | 'floating';
  className?: string;
  animate?: boolean;
  withBackground?: boolean; // New prop to control background display
}

const sizeMap = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
  '2xl': 'w-28 h-28',
  '3xl': 'w-32 h-32',
  '4xl': 'w-40 h-40'
};

const containerSizeMap = {
  xs: 'w-8 h-8',
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-18 h-18',
  xl: 'w-22 h-22',
  '2xl': 'w-30 h-30',
  '3xl': 'w-34 h-34',
  '4xl': 'w-42 h-42'
};

const paddingMap = {
  xs: 'p-1',
  sm: 'p-1',
  md: 'p-1.5',
  lg: 'p-2',
  xl: 'p-2.5',
  '2xl': 'p-3',
  '3xl': 'p-4',
  '4xl': 'p-4'
};

export function StudyBuddyLogo({
  size = 'md',
  variant = 'default',
  className = '',
  animate = false,
  withBackground = true
}: StudyBuddyLogoProps) {
  const logoSize = sizeMap[size];
  const containerSize = withBackground ? containerSizeMap[size] : logoSize;
  const padding = withBackground ? paddingMap[size] : '';

  const getVariantStyles = () => {
    // If no background, return minimal styles
    if (!withBackground) {
      return 'bg-transparent';
    }

    switch (variant) {
      case 'bordered':
        return 'bg-gradient-to-br from-white/90 via-white/95 to-primary/5 dark:from-white/10 dark:via-white/15 dark:to-primary/5 border-2 border-primary/30 dark:border-white/30 shadow-md hover:border-primary/50 dark:hover:border-white/50 hover:shadow-lg transition-all duration-300';
      case 'elevated':
        return 'bg-gradient-to-br from-white/95 via-white/98 to-primary/5 dark:from-white/15 dark:via-white/20 dark:to-primary/8 border border-primary/25 dark:border-white/25 shadow-lg hover:shadow-xl hover:border-primary/40 dark:hover:border-white/40 hover:scale-105 transition-all duration-300';
      case 'glow':
        return 'bg-gradient-to-br from-primary/15 via-white/80 to-primary/10 dark:from-white/20 dark:via-white/25 dark:to-primary/10 border border-primary/40 dark:border-white/40 shadow-lg shadow-primary/25 dark:shadow-white/15 hover:shadow-xl hover:shadow-primary/35 dark:hover:shadow-white/25 hover:scale-105 transition-all duration-300';
      case 'floating':
        return 'bg-gradient-to-br from-white/95 via-white/98 to-primary/8 dark:from-white/20 dark:via-white/25 dark:to-primary/12 border border-primary/30 dark:border-white/35 shadow-2xl shadow-primary/20 dark:shadow-white/20 hover:shadow-3xl hover:shadow-primary/30 dark:hover:shadow-white/30 hover:scale-110 transition-all duration-500 logo-float';
      case 'minimal':
        return 'bg-transparent hover:bg-primary/8 dark:hover:bg-white/5 transition-all duration-300';
      default:
        return 'bg-gradient-to-br from-white/90 via-white/95 to-primary/5 dark:from-white/10 dark:via-white/15 dark:to-primary/8 border border-primary/25 dark:border-white/25 hover:border-primary/35 dark:hover:border-white/35 transition-all duration-300';
    }
  };

  const getAnimationClass = () => {
    if (!animate) return '';
    return variant === 'floating' ? 'logo-float' : 'hover:logo-pulse-glow';
  };

  return (
    <div
      className={`
        ${containerSize} 
        ${padding}
        ${withBackground ? 'rounded-full' : ''} 
        flex 
        items-center 
        justify-center 
        ${withBackground ? 'overflow-hidden' : ''}
        relative
        ${getVariantStyles()}
        ${getAnimationClass()}
        ${className}
      `}
    >
      <img
        src={studyBuddyLogo}
        alt="Study Buddy Logo"
        className={`${logoSize} object-contain relative z-10`}
      />

      {/* Subtle inner glow for enhanced variants */}
      {withBackground && (variant === 'glow' || variant === 'floating') && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/5 via-transparent to-primary/10 dark:from-white/3 dark:via-transparent dark:to-white/8 pointer-events-none" />
      )}
    </div>
  );
}
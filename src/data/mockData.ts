import { Badge } from '../types';

// Badge templates - these are not mock data but achievement definitions
export const availableBadges: Badge[] = [
  {
    id: 'badge-quickstart',
    name: 'Quick Starter',
    description: 'Complete your first assessment',
    icon: '🚀',
    earnedAt: new Date(),
    category: 'completion'
  },
  {
    id: 'badge-perfectscore',
    name: 'Perfect Score',
    description: 'Score 100% on any assessment',
    icon: '💯',
    earnedAt: new Date(),
    category: 'mastery'
  },
  {
    id: 'badge-speedster',
    name: 'Speed Demon',
    description: 'Complete an assessment in under 10 minutes',
    icon: '⚡',
    earnedAt: new Date(),
    category: 'special'
  },
  {
    id: 'badge-persistent',
    name: 'Never Give Up',
    description: 'Complete 20 lessons',
    icon: '💪',
    earnedAt: new Date(),
    category: 'completion'
  },
  {
    id: 'badge-firststeps',
    name: 'First Steps',
    description: 'Completed your first lesson',
    icon: '🌟',
    earnedAt: new Date(),
    category: 'completion'
  },
  {
    id: 'badge-codewarrior',
    name: 'Code Warrior',
    description: 'Completed 10 coding challenges',
    icon: '⚔️',
    earnedAt: new Date(),
    category: 'mastery'
  },
  {
    id: 'badge-streakmaster',
    name: 'Streak Master',
    description: 'Maintained a 7-day learning streak',
    icon: '🔥',
    earnedAt: new Date(),
    category: 'streak'
  }
];

// Reserved usernames for the system
export const RESERVED_SYSTEM_USERNAMES = new Set(['UserAdministrator123', 'admin', 'administrator', 'root', 'system']);

// Admin account credentials
export const ADMIN_CREDENTIALS = {
  userId: 'YCW-158-KA-4678',
  username: 'UserAdministrator123'
};

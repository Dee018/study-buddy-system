import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Zap, Plus, Star } from 'lucide-react';

interface XPPopupProps {
  show: boolean;
  points: number;
  title: string;
  onComplete?: () => void;
  uniqueKey?: string; // Optional unique identifier to prevent duplicate displays
}

export function XPPopup({ show, points, title, onComplete, uniqueKey }: XPPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dismissedRef = useRef(false);

  // Handle dismissal with smooth animation
  const handleDismiss = useCallback(() => {
    if (dismissedRef.current) return; // Prevent multiple dismissals

    dismissedRef.current = true;
    setIsDismissing(true);

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Wait for exit animation to complete before calling onComplete
    setTimeout(() => {
      setIsVisible(false);
      setIsDismissing(false);
      dismissedRef.current = false;
      if (onComplete) onComplete();
    }, 300); // Match exit animation duration
  }, [onComplete]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible && !isDismissing) {
        handleDismiss();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [isVisible, isDismissing, handleDismiss]);

  // Handle show/hide logic with auto-dismiss
  useEffect(() => {
    if (show && !isVisible) {
      // Check if this XP was already shown in this session (prevent duplicates on refresh)
      if (uniqueKey) {
        const shownKey = `xp_shown_${uniqueKey}`;
        const wasShown = sessionStorage.getItem(shownKey);
        if (wasShown) {
          // Already shown in this session, skip
          if (onComplete) onComplete();
          return;
        }
        // Mark as shown for this session
        sessionStorage.setItem(shownKey, 'true');
      }

      setIsVisible(true);
      dismissedRef.current = false;

      // Auto-dismiss after 2.5 seconds
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, 2500);
    } else if (!show && isVisible) {
      // Parent requested hide
      handleDismiss();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [show, isVisible, onComplete, uniqueKey, handleDismiss]);

  // Handle outside click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isDismissing) {
      handleDismiss();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
          style={{ pointerEvents: 'auto' }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -10 }}
            transition={({ type: "spring", stiffness: 300, damping: 25, exit: { duration: 0.3 } } as any)}
            onClick={(e) => e.stopPropagation()}
            className="relative"
          >
            <Card className="border-2 border-primary shadow-2xl bg-white dark:bg-gray-900 min-w-[320px]">
              <CardContent className="p-6 text-center space-y-4">
                <motion.div
                  initial={{ rotate: 0, scale: 0 }}
                  animate={{ rotate: 360, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg border-4 border-primary/30"
                  style={{
                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.3)'
                  }}
                >
                  <Zap className="w-10 h-10 text-white" />
                </motion.div>

                <div>
                  <h3 className="text-2xl mb-2 text-gray-900 dark:text-gray-100">🎉 XP Earned!</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{title}</p>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 400 }}
                    className="flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <Badge variant="default" className="text-xl px-5 py-2 bg-green-600 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-600 text-white shadow-lg">
                      {points} XP
                    </Badge>
                    <Star className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  Keep up the great work! 🚀
                </motion.div>

                {/* Subtle hint for dismissal */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 1 }}
                  className="text-xs text-gray-500 dark:text-gray-500 pt-2"
                >
                  Click outside or press ESC to continue
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
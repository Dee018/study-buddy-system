/**
 * Notification Context
 * 
 * Provides toast notifications for user feedback
 * Replaces scattered toast calls with centralized system
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner@2.0.3';

// ============================================================================
// TYPES
// ============================================================================

export interface NotificationContextType {
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
  loading: (message: string) => string | number;
  dismiss: (toastId?: string | number) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const NotificationContext = createContext<NotificationContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export function NotificationProvider({ children }: { children: ReactNode }) {
  /**
   * Show success notification
   */
  const success = (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
    });
  };

  /**
   * Show error notification
   */
  const error = (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
    });
  };

  /**
   * Show info notification
   */
  const info = (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 3000,
    });
  };

  /**
   * Show warning notification
   */
  const warning = (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
    });
  };

  /**
   * Show loading notification
   * Returns toast ID for later dismissal
   */
  const loading = (message: string) => {
    return toast.loading(message);
  };

  /**
   * Dismiss notification
   */
  const dismiss = (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  const value: NotificationContextType = {
    success,
    error,
    info,
    warning,
    loading,
    dismiss,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access notification context
 * Must be used within NotificationProvider
 */
export function useNotification() {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
}

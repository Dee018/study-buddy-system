/**
 * Copy-Paste Prevention Utility
 * Prevents copy-paste ONLY in assessment and exercise code areas
 * Used to maintain academic integrity during evaluations
 * 
 * IMPORTANT: This utility ONLY blocks clipboard operations (Copy/Paste/Cut).
 * ALL other keyboard functionality remains fully enabled, including:
 * - Tab key for indentation
 * - Arrow keys for navigation
 * - Ctrl+Z/Cmd+Z for undo
 * - Ctrl+A/Cmd+A for select all
 * - All other standard text editing shortcuts
 */

/**
 * Event handler to prevent copy operations
 */
// Runtime toggle to enable/disable copy-paste prevention. Set to `false` to
// disable prevention (useful for temporarily hiding the feature). Toggle
// via `setCopyPastePreventionEnabled(true|false)` at runtime.
export let COPY_PASTE_PREVENTION_ENABLED = false;

export const setCopyPastePreventionEnabled = (v: boolean) => {
  COPY_PASTE_PREVENTION_ENABLED = v;
};

export const preventCopy = (e: ClipboardEvent) => {
  if (!COPY_PASTE_PREVENTION_ENABLED) return true;
  e.preventDefault();
  return false;
};

/**
 * Event handler to prevent paste operations
 */
export const preventPaste = (e: ClipboardEvent) => {
  if (!COPY_PASTE_PREVENTION_ENABLED) return true;
  e.preventDefault();
  return false;
};

/**
 * Event handler to prevent cut operations
 */
export const preventCut = (e: ClipboardEvent) => {
  if (!COPY_PASTE_PREVENTION_ENABLED) return true;
  e.preventDefault();
  return false;
};

/**
 * Attach copy-paste prevention to a textarea or input element
 * @param element - The DOM element to attach prevention to
 * @returns Cleanup function to remove listeners
 */
export const attachCopyPastePrevention = (element: HTMLElement): (() => void) => {
  if (!element) return () => { };
  // If prevention is disabled, return a no-op cleanup immediately.
  if (!COPY_PASTE_PREVENTION_ENABLED) return () => { };

  // Add event listeners
  element.addEventListener('copy', preventCopy);
  element.addEventListener('paste', preventPaste);
  element.addEventListener('cut', preventCut);

  // Also prevent using keyboard shortcuts
  const preventKeyboardShortcuts = (e: KeyboardEvent) => {
    if (!COPY_PASTE_PREVENTION_ENABLED) return true;
    // Prevent Ctrl+C, Ctrl+V, Ctrl+X, Cmd+C, Cmd+V, Cmd+X
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
      e.preventDefault();
      return false;
    }
  };

  element.addEventListener('keydown', preventKeyboardShortcuts);

  // Return cleanup function
  return () => {
    element.removeEventListener('copy', preventCopy);
    element.removeEventListener('paste', preventPaste);
    element.removeEventListener('cut', preventCut);
    element.removeEventListener('keydown', preventKeyboardShortcuts);
  };
};

/**
 * React hook for copy-paste prevention
 * Usage: const textareaRef = useCopyPastePrevention<HTMLTextAreaElement>();
 */
export const useCopyPastePrevention = <T extends HTMLElement>() => {
  return (element: T | null) => {
    if (!element) return;
    return attachCopyPastePrevention(element);
  };
};

/**
 * Props for components that need copy-paste prevention
 */
import React from 'react';

export interface CopyPastePreventionProps {
  onCopy?: React.ClipboardEventHandler<any>;
  onPaste?: React.ClipboardEventHandler<any>;
  onCut?: React.ClipboardEventHandler<any>;
}

/**
 * React-friendly handlers that delegate to DOM handlers where needed.
 * These match React's event types so they can be spread into JSX props.
 */
export const preventCopyReact: React.ClipboardEventHandler<any> = (e) => {
  if (!COPY_PASTE_PREVENTION_ENABLED) return;
  try { e.preventDefault(); } catch { }
};
export const preventPasteReact: React.ClipboardEventHandler<any> = (e) => {
  if (!COPY_PASTE_PREVENTION_ENABLED) return;
  try { e.preventDefault(); } catch { }
};
export const preventCutReact: React.ClipboardEventHandler<any> = (e) => {
  if (!COPY_PASTE_PREVENTION_ENABLED) return;
  try { e.preventDefault(); } catch { }
};

/**
 * Get props for textarea with copy-paste prevention (React handlers)
 */
export const getCopyPastePreventionProps = (): CopyPastePreventionProps => {
  if (!COPY_PASTE_PREVENTION_ENABLED) return {};
  return {
    onCopy: preventCopyReact,
    onPaste: preventPasteReact,
    onCut: preventCutReact,
  };
};

export default {
  preventCopy,
  preventPaste,
  preventCut,
  attachCopyPastePrevention,
  useCopyPastePrevention,
  getCopyPastePreventionProps,
};

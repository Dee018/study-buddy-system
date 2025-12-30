/**
 * Code Editor Utility Functions
 * Provides keyboard shortcut handlers for code editors
 * Ensures Tab indentation and other IDE-like features work properly
 */

/**
 * Handle Tab key for indentation in code editors
 * Inserts a tab character (or spaces) at cursor position instead of moving focus
 */
export const handleTabKey = (
  e: React.KeyboardEvent<HTMLTextAreaElement>
): void => {
  if (e.key === 'Tab') {
    e.preventDefault();
    
    const target = e.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const value = target.value;
    
    // Use 2 spaces for tab (common Java convention)
    const tabChar = '  ';
    
    if (e.shiftKey) {
      // Shift+Tab: Outdent (remove indentation)
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = value.indexOf('\n', start);
      const currentLine = value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd);
      
      if (currentLine.startsWith(tabChar)) {
        // Remove one level of indentation
        const newValue = value.substring(0, lineStart) + currentLine.substring(tabChar.length) + value.substring(lineEnd === -1 ? value.length : lineEnd);
        target.value = newValue;
        target.selectionStart = target.selectionEnd = start - tabChar.length;
      }
    } else {
      // Tab: Indent (add tab at cursor position)
      const newValue = value.substring(0, start) + tabChar + value.substring(end);
      target.value = newValue;
      target.selectionStart = target.selectionEnd = start + tabChar.length;
    }
    
    // Trigger onChange event manually
    const event = new Event('input', { bubbles: true });
    target.dispatchEvent(event);
  }
};

/**
 * Get props for code editor textareas with full keyboard support
 * Includes Tab indentation while preserving other IDE shortcuts
 */
export const getCodeEditorProps = () => {
  return {
    onKeyDown: handleTabKey,
    spellCheck: false,
    autoComplete: 'off',
    autoCorrect: 'off',
    autoCapitalize: 'off',
  };
};

/**
 * Handle line numbers display (future enhancement)
 */
export const getLineNumbers = (code: string): string[] => {
  return code.split('\n').map((_, index) => String(index + 1));
};

export default {
  handleTabKey,
  getCodeEditorProps,
  getLineNumbers,
};

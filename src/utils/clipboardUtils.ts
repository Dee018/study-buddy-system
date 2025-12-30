/**
 * Clipboard Utilities
 * Provides safe clipboard operations with fallback methods
 * Handles Clipboard API permissions issues
 */

/**
 * Safely copy text to clipboard with fallback methods
 * @param text - The text to copy to clipboard
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Method 1: Try modern Clipboard API (requires HTTPS or localhost)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (clipboardErr: any) {
      // Silently fail for permissions policy blocks - fallback will handle it
      // Only log if it's not a NotAllowedError or permissions policy block
      const errorName = clipboardErr?.name || '';
      const errorMessage = clipboardErr?.message || '';

      if (
        !errorName.includes('NotAllowed') &&
        !errorMessage.includes('permissions policy') &&
        !errorMessage.includes('Clipboard API has been blocked')
      ) {
        // Clipboard API failed, using fallback (silent)
      }
      // Continue to fallback method
    }
  }

  // Method 2: Fallback using textarea and execCommand (works in more contexts)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Make the textarea invisible but still part of the document
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');

    document.body.appendChild(textArea);

    try {
      // Select the text
      textArea.focus();
      textArea.select();

      // For iOS compatibility
      const range = document.createRange();
      range.selectNodeContents(textArea);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      textArea.setSelectionRange(0, text.length);

      // Try to copy using execCommand
      const successful = document.execCommand('copy');

      if (successful) {
        return true;
      } else {
        console.error('Copy failed: execCommand returned false');
        return false;
      }
    } finally {
      // Always remove the textarea
      if (textArea.parentNode) {
        document.body.removeChild(textArea);
      }
    }
  } catch (err) {
    console.error('All copy methods failed:', err);
    return false;
  }
}

/**
 * Check if clipboard write is supported
 * @returns boolean - True if clipboard write is supported
 */
export function isClipboardWriteSupported(): boolean {
  try {
    return (
      (navigator.clipboard && window.isSecureContext) ||
      document.queryCommandSupported('copy')
    );
  } catch (err) {
    console.error('Error checking clipboard support:', err);
    return false;
  }
}

/**
 * Read text from clipboard (requires user permission)
 * @returns Promise<string | null> - The clipboard text or null if failed
 */
export async function readFromClipboard(): Promise<string | null> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      const text = await navigator.clipboard.readText();
      return text;
    }
    return null;
  } catch (err) {
    console.error('Failed to read from clipboard:', err);
    return null;
  }
}

/**
 * Copy text with visual feedback
 * @param text - The text to copy
 * @param onSuccess - Callback function on success
 * @param onError - Callback function on error
 */
export async function copyWithFeedback(
  text: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    const success = await copyToClipboard(text);
    if (success && onSuccess) {
      onSuccess();
    } else if (!success && onError) {
      onError(new Error('Failed to copy to clipboard'));
    }
  } catch (err) {
    if (onError) {
      onError(err as Error);
    }
  }
}

export default {
  copyToClipboard,
  isClipboardWriteSupported,
  readFromClipboard,
  copyWithFeedback
};

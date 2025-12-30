/**
 * Comprehensive error handling utilities
 * Provides safe wrappers for common operations that might fail
 */

// Safe number operations
export function safeDivide(numerator: number, denominator: number, fallback: number = 0): number {
  try {
    if (!isFinite(numerator) || !isFinite(denominator)) return fallback;
    if (denominator === 0) return fallback;
    const result = numerator / denominator;
    return isFinite(result) ? result : fallback;
  } catch (error) {
    console.error('Error in safeDivide:', error);
    return fallback;
  }
}

// Safe percentage calculation
export function safePercentage(part: number, total: number): number {
  try {
    if (total === 0 || !isFinite(total) || !isFinite(part)) return 0;
    const percentage = (part / total) * 100;
    const clamped = Math.max(0, Math.min(100, percentage));
    return isFinite(clamped) ? Math.round(clamped) : 0;
  } catch (error) {
    console.error('Error in safePercentage:', error);
    return 0;
  }
}

// Safe array access
export function safeArrayAccess<T>(array: T[] | null | undefined, index: number, fallback: T): T {
  try {
    if (!Array.isArray(array)) return fallback;
    if (index < 0 || index >= array.length) return fallback;
    return array[index] ?? fallback;
  } catch (error) {
    console.error('Error in safeArrayAccess:', error);
    return fallback;
  }
}

// Safe object property access
export function safeGet<T>(obj: any, path: string, fallback: T): T {
  try {
    if (!obj || typeof obj !== 'object') return fallback;
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined) return fallback;
      current = current[key];
    }
    
    return current !== undefined && current !== null ? current : fallback;
  } catch (error) {
    console.error('Error in safeGet:', error);
    return fallback;
  }
}

// Safe parseInt
export function safeParseInt(value: any, fallback: number = 0): number {
  try {
    if (typeof value === 'number') {
      return isFinite(value) ? Math.floor(value) : fallback;
    }
    const parsed = parseInt(String(value), 10);
    return isFinite(parsed) ? parsed : fallback;
  } catch (error) {
    console.error('Error in safeParseInt:', error);
    return fallback;
  }
}

// Safe parseFloat
export function safeParseFloat(value: any, fallback: number = 0): number {
  try {
    if (typeof value === 'number') {
      return isFinite(value) ? value : fallback;
    }
    const parsed = parseFloat(String(value));
    return isFinite(parsed) ? parsed : fallback;
  } catch (error) {
    console.error('Error in safeParseFloat:', error);
    return fallback;
  }
}

// Safe date parsing
export function safeDateParse(dateString: string): Date | null {
  try {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error('Error in safeDateParse:', error);
    return null;
  }
}

// Safe JSON parse
export function safeJSONParse<T>(jsonString: string, fallback: T): T {
  try {
    if (!jsonString || typeof jsonString !== 'string') return fallback;
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error in safeJSONParse:', error);
    return fallback;
  }
}

// Safe JSON stringify
export function safeJSONStringify(obj: any, fallback: string = '{}'): string {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.error('Error in safeJSONStringify:', error);
    return fallback;
  }
}

// Safe array reduce
export function safeReduce<T, R>(
  array: T[] | null | undefined,
  reducer: (acc: R, item: T, index: number) => R,
  initialValue: R
): R {
  try {
    if (!Array.isArray(array)) return initialValue;
    return array.reduce(reducer, initialValue);
  } catch (error) {
    console.error('Error in safeReduce:', error);
    return initialValue;
  }
}

// Safe array filter
export function safeFilter<T>(
  array: T[] | null | undefined,
  predicate: (item: T, index: number) => boolean
): T[] {
  try {
    if (!Array.isArray(array)) return [];
    return array.filter(predicate);
  } catch (error) {
    console.error('Error in safeFilter:', error);
    return [];
  }
}

// Safe array map
export function safeMap<T, R>(
  array: T[] | null | undefined,
  mapper: (item: T, index: number) => R
): R[] {
  try {
    if (!Array.isArray(array)) return [];
    return array.map(mapper);
  } catch (error) {
    console.error('Error in safeMap:', error);
    return [];
  }
}

// Safe array find
export function safeFind<T>(
  array: T[] | null | undefined,
  predicate: (item: T, index: number) => boolean,
  fallback: T | null = null
): T | null {
  try {
    if (!Array.isArray(array)) return fallback;
    const found = array.find(predicate);
    return found !== undefined ? found : fallback;
  } catch (error) {
    console.error('Error in safeFind:', error);
    return fallback;
  }
}

// Validate user data
export function validateUserData(userData: any): boolean {
  try {
    if (!userData || typeof userData !== 'object') return false;
    if (!userData.id || typeof userData.id !== 'string') return false;
    if (!userData.username || typeof userData.username !== 'string') return false;
    return true;
  } catch (error) {
    console.error('Error in validateUserData:', error);
    return false;
  }
}

// Validate progress data
export function validateProgressData(progress: any): boolean {
  try {
    if (!progress || typeof progress !== 'object') return false;
    if (!Array.isArray(progress.completedModules)) return false;
    if (!progress.moduleProgress || typeof progress.moduleProgress !== 'object') return false;
    return true;
  } catch (error) {
    console.error('Error in validateProgressData:', error);
    return false;
  }
}

// Safe number to locale string
export function safeToLocaleString(num: number | null | undefined, fallback: string = '0'): string {
  try {
    if (num === null || num === undefined || !isFinite(num)) return fallback;
    return num.toLocaleString();
  } catch (error) {
    console.error('Error in safeToLocaleString:', error);
    return fallback;
  }
}

// Retry operation with exponential backoff
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries - 1) {
        console.error('Operation failed after max retries:', error);
        return null;
      }
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
    }
  }
  return null;
}

// Debounce function to prevent rapid calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function to limit call frequency
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

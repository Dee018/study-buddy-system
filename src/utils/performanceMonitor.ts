/**
 * Performance Monitor
 * Tracks and optimizes application performance
 */

export interface PerformanceMetrics {
  componentRenderTime: number;
  totalRenderCount: number;
  averageRenderTime: number;
  slowRenders: number; // Renders taking > 16ms
  memoryUsage?: number;
  timestamp: number;
}

export interface ComponentMetrics {
  name: string;
  renderCount: number;
  totalTime: number;
  averageTime: number;
  lastRenderTime: number;
}

export class PerformanceMonitor {
  private static metrics: Map<string, ComponentMetrics> = new Map();
  private static renderTimers: Map<string, number> = new Map();
  private static enabled: boolean = process.env.NODE_ENV === 'development';

  /**
   * Start tracking a component render
   */
  static startRender(componentName: string): void {
    if (!this.enabled) return;

    this.renderTimers.set(componentName, performance.now());
  }

  /**
   * End tracking a component render
   */
  static endRender(componentName: string): number {
    if (!this.enabled) return 0;

    const startTime = this.renderTimers.get(componentName);
    if (!startTime) return 0;

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Update metrics
    const existingMetrics = this.metrics.get(componentName);
    if (existingMetrics) {
      existingMetrics.renderCount++;
      existingMetrics.totalTime += renderTime;
      existingMetrics.averageTime = existingMetrics.totalTime / existingMetrics.renderCount;
      existingMetrics.lastRenderTime = renderTime;
    } else {
      this.metrics.set(componentName, {
        name: componentName,
        renderCount: 1,
        totalTime: renderTime,
        averageTime: renderTime,
        lastRenderTime: renderTime
      });
    }

    this.renderTimers.delete(componentName);

    // Warn about slow renders
    if (renderTime > 16) {
      // Slow render detected (silent)
    }

    return renderTime;
  }

  /**
   * Get metrics for a specific component
   */
  static getComponentMetrics(componentName: string): ComponentMetrics | null {
    return this.metrics.get(componentName) || null;
  }

  /**
   * Get all metrics
   */
  static getAllMetrics(): ComponentMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get performance summary
   */
  static getPerformanceSummary(): {
    totalComponents: number;
    totalRenders: number;
    averageRenderTime: number;
    slowestComponent: ComponentMetrics | null;
    fastestComponent: ComponentMetrics | null;
  } {
    const allMetrics = this.getAllMetrics();

    if (allMetrics.length === 0) {
      return {
        totalComponents: 0,
        totalRenders: 0,
        averageRenderTime: 0,
        slowestComponent: null,
        fastestComponent: null
      };
    }

    const totalRenders = allMetrics.reduce((sum, m) => sum + m.renderCount, 0);
    const totalTime = allMetrics.reduce((sum, m) => sum + m.totalTime, 0);
    const averageRenderTime = totalTime / totalRenders;

    const sortedByAverage = [...allMetrics].sort((a, b) => b.averageTime - a.averageTime);

    return {
      totalComponents: allMetrics.length,
      totalRenders,
      averageRenderTime,
      slowestComponent: sortedByAverage[0] || null,
      fastestComponent: sortedByAverage[sortedByAverage.length - 1] || null
    };
  }

  /**
   * Reset all metrics
   */
  static reset(): void {
    this.metrics.clear();
    this.renderTimers.clear();
  }

  /**
   * Get memory usage (if available)
   */
  static getMemoryUsage(): number | null {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1048576; // Convert to MB
    }
    return null;
  }

  /**
   * Log performance report
   */
  static logReport(): void {
    if (!this.enabled) return;

    // Performance report generation (no console output in production or development)
  }

  /**
   * Enable or disable monitoring
   */
  static setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if monitoring is enabled
   */
  static isEnabled(): boolean {
    return this.enabled;
  }
}

/**
 * React hook for component performance tracking
 */
export function usePerformanceTracking(componentName: string) {
  if (typeof window === 'undefined') return;

  // Track render start
  PerformanceMonitor.startRender(componentName);

  // Track render end on component mount/update
  setTimeout(() => {
    PerformanceMonitor.endRender(componentName);
  }, 0);
}

/**
 * Higher-order component for performance tracking
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => {
    const name = componentName || Component.displayName || Component.name || 'Unknown';

    PerformanceMonitor.startRender(name);

    setTimeout(() => {
      PerformanceMonitor.endRender(name);
    }, 0);

    // Use createElement to avoid JSX in a .ts file
    return React.createElement(Component, props as any);
  };

  WrappedComponent.displayName = `WithPerformanceTracking(${componentName || Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Measure async operation performance
 */
export async function measureAsync<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await operation();
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (PerformanceMonitor.isEnabled()) {
      // measurement available (silent)
    }

    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (PerformanceMonitor.isEnabled()) {
      console.error(`❌ ${operationName} failed after ${duration.toFixed(2)}ms`, error);
    }

    throw error;
  }
}

/**
 * Measure sync operation performance
 */
export function measureSync<T>(
  operationName: string,
  operation: () => T
): T {
  const startTime = performance.now();

  try {
    const result = operation();
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (PerformanceMonitor.isEnabled()) {
      // measurement available (silent)
    }

    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (PerformanceMonitor.isEnabled()) {
      console.error(`❌ ${operationName} failed after ${duration.toFixed(2)}ms`, error);
    }

    throw error;
  }
}

/**
 * Batch operations for better performance
 */
export function batchOperations<T>(
  operations: Array<() => T>,
  batchSize: number = 10
): T[] {
  const results: T[] = [];

  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    const batchResults = batch.map(op => op());
    results.push(...batchResults);
  }

  return results;
}

/**
 * Lazy load component with performance tracking
 */
export function lazyLoadComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    const startTime = performance.now();

    try {
      const module = await importFn();
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (PerformanceMonitor.isEnabled()) {
        // module load timing recorded (silent)
      }

      return module;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (PerformanceMonitor.isEnabled()) {
        console.error(`❌ Failed to load ${componentName} after ${duration.toFixed(2)}ms`, error);
      }

      throw error;
    }
  });
}

// React is required for types and createElement
import React from 'react';

"use client";
import * as React from "react";
import { cn } from "./utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<"div"> {
  value?: number;
  showValue?: boolean;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, showValue = false, indicatorClassName, ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));
    
    return (
      <div className="relative w-full">
        <div
          ref={ref}
          data-slot="progress"
          className={cn(
            "h-5 w-full rounded-full bg-gradient-to-r from-muted/90 via-muted to-muted/90 shadow-md border border-border/30 overflow-hidden",
            className,
          )}
          {...props}
        >
          <div
            data-slot="progress-indicator"
            className={cn(
              "h-full rounded-full bg-gradient-to-r from-primary via-primary/95 to-primary shadow-lg",
              "transition-all duration-500 ease-out",
              "relative overflow-hidden",
              "ring-1 ring-primary/20",
              indicatorClassName,
            )}
            style={{ width: `${clampedValue}%` }}
          >
            {/* Enhanced shimmer effect for better visibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                 style={{
                   backgroundSize: '200% 100%',
                   animation: 'shimmer 2s infinite'
                 }}
            />
            {/* Additional glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
          </div>
        </div>
        {showValue && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-2 text-xs font-bold text-primary drop-shadow-sm">
            {Math.round(clampedValue)}%
          </div>
        )}
      </div>
    );
  }
);
Progress.displayName = "Progress";

const ProgressIndicator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="progress-indicator"
    className={cn(
      "h-4 rounded-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 transition-all duration-500 ease-out",
      className,
    )}
    {...props}
  />
));
ProgressIndicator.displayName = "ProgressIndicator";

export { Progress, ProgressIndicator };
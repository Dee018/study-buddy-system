"use client";
import * as React from "react";
import { cn } from "./utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<"input">
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    data-slot="input"
    className={cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
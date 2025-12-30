"use client";
import * as React from "react";
import { cn } from "./utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentPropsWithoutRef<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    data-slot="textarea"
    className={cn(
      "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
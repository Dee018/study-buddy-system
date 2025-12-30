"use client";
import * as React from "react";
import { cn } from "./utils";

const Sonner = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="sonner"
    className={cn("fixed bottom-4 right-4 z-50", className)}
    {...props}
  />
));
Sonner.displayName = "Sonner";

export { Sonner };
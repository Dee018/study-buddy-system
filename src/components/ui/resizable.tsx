"use client";
import * as React from "react";
import { cn } from "./utils";

const Resizable = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="resizable"
    className={cn("resize overflow-auto border p-2", className)}
    {...props}
  />
));
Resizable.displayName = "Resizable";

export { Resizable };
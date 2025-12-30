"use client";
import * as React from "react";
import { cn } from "./utils";

const Toggle = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    data-slot="toggle"
    className={cn("px-3 py-1 border rounded-md", className)}
    {...props}
  />
));
Toggle.displayName = "Toggle";

export { Toggle };
"use client";
import * as React from "react";
import { cn } from "./utils";

const Separator = React.forwardRef<
  HTMLHRElement,
  React.ComponentPropsWithoutRef<"hr">
>(({ className, ...props }, ref) => (
  <hr
    ref={ref}
    data-slot="separator"
    className={cn(
      "border-border bg-border h-px my-2",
      className,
    )}
    {...props}
  />
));
Separator.displayName = "Separator";

export { Separator };
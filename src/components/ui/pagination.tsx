"use client";
import * as React from "react";
import { cn } from "./utils";

const Pagination = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="pagination"
    className={cn(
      "inline-flex items-center space-x-2",
      className,
    )}
    {...props}
  />
));
Pagination.displayName = "Pagination";

export { Pagination };
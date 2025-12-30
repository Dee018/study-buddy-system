"use client";
import * as React from "react";
import { cn } from "./utils";

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="sidebar"
    className={cn(
      "flex flex-col w-64 bg-background border-r",
      className,
    )}
    {...props}
  />
));
Sidebar.displayName = "Sidebar";

export { Sidebar };
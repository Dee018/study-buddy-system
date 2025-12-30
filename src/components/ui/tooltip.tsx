"use client";
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "./utils";

const Tooltip = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>
>((props, ref) => (
  <TooltipPrimitive.Root
    ref={ref}
    data-slot="tooltip"
    {...props}
  />
));
Tooltip.displayName = "Tooltip";

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<
    typeof TooltipPrimitive.Trigger
  >
>((props, ref) => (
  <TooltipPrimitive.Trigger
    ref={ref}
    data-slot="tooltip-trigger"
    {...props}
  />
));
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<
    typeof TooltipPrimitive.Content
  >
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    data-slot="tooltip-content"
    className={cn(
      "rounded-md bg-background p-2 text-sm shadow-md",
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = "TooltipContent";

const TooltipProvider = TooltipPrimitive.Provider;
TooltipProvider.displayName = "TooltipProvider";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
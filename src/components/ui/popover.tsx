"use client";
import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "./utils";

const Popover = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>
>((props, ref) => (
  <PopoverPrimitive.Root
    ref={ref}
    data-slot="popover"
    {...props}
  />
));
Popover.displayName = "Popover";

const PopoverTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<
    typeof PopoverPrimitive.Trigger
  >
>((props, ref) => (
  <PopoverPrimitive.Trigger
    ref={ref}
    data-slot="popover-trigger"
    {...props}
  />
));
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<
    typeof PopoverPrimitive.Content
  >
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Content
    ref={ref}
    data-slot="popover-content"
    className={cn(
      "rounded-md border bg-background p-4 shadow-md",
      className,
    )}
    {...props}
  />
));
PopoverContent.displayName = "PopoverContent";

const PopoverAnchor = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Anchor>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Anchor>
>((props, ref) => (
  <PopoverPrimitive.Anchor
    ref={ref}
    data-slot="popover-anchor"
    {...props}
  />
));
PopoverAnchor.displayName = "PopoverAnchor";

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };

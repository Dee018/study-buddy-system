"use client";
import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "./utils";

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<
    typeof ToggleGroupPrimitive.Root
  >
>((props, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    data-slot="toggle-group"
    {...props}
  />
));
ToggleGroup.displayName = "ToggleGroup";

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<
    typeof ToggleGroupPrimitive.Item
  >
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    data-slot="toggle-group-item"
    className={cn("px-3 py-1 border rounded-md", className)}
    {...props}
  />
));
ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };
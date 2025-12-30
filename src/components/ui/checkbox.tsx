"use client";
import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "./utils";
import { CheckIcon } from "lucide-react";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    data-slot="checkbox"
    className={cn(
      "w-4 h-4 rounded border border-input bg-background accent-primary checked:border-primary checked:bg-primary",
      className,
    )}
    {...props}
  />
));
Checkbox.displayName = "Checkbox";

const CheckboxIndicator = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<
    typeof CheckboxPrimitive.Indicator
  >
>((props, ref) => (
  <CheckboxPrimitive.Indicator
    ref={ref}
    data-slot="checkbox-indicator"
    {...props}
  >
    <CheckIcon className="h-4 w-4" />
  </CheckboxPrimitive.Indicator>
));
CheckboxIndicator.displayName = "CheckboxIndicator";

export { Checkbox, CheckboxIndicator };
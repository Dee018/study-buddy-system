"use client";
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "./utils";

const Select = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>
>((props, ref) => (
  <SelectPrimitive.Root
    ref={ref}
    data-slot="select"
    {...props}
  />
));
Select.displayName = "Select";

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    data-slot="select-trigger"
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border px-3 py-2",
      className,
    )}
    {...props}
  />
));
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Content
    ref={ref}
    data-slot="select-content"
    className={cn(
      "rounded-md border bg-background p-2 shadow-md",
      className,
    )}
    {...props}
  />
));
SelectContent.displayName = "SelectContent";

const SelectGroup = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Group>
>((props, ref) => (
  <SelectPrimitive.Group
    ref={ref}
    data-slot="select-group"
    {...props}
  />
));
SelectGroup.displayName = "SelectGroup";

const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>((props, ref) => (
  <SelectPrimitive.Value
    ref={ref}
    data-slot="select-value"
    {...props}
  />
));
SelectValue.displayName = "SelectValue";

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    data-slot="select-item"
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    data-slot="select-label"
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    data-slot="select-separator"
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectValue,
  SelectItem,
  SelectLabel,
  SelectSeparator,
};

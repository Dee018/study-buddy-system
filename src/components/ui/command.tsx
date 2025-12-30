"use client";
import * as React from "react";
import * as CommandPrimitive from "@radix-ui/react-command";
import { cn } from "./utils";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Root>
>((props, ref) => (
  <CommandPrimitive.Root
    ref={ref}
    data-slot="command"
    {...props}
  />
));
Command.displayName = "Command";

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Input
    ref={ref}
    data-slot="command-input"
    className={cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
CommandInput.displayName = "CommandInput";

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>((props, ref) => (
  <CommandPrimitive.List
    ref={ref}
    data-slot="command-list"
    {...props}
  />
));
CommandList.displayName = "CommandList";

export { Command, CommandInput, CommandList };
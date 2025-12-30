"use client";
import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { cn } from "./utils";

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>((props, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    data-slot="menubar"
    {...props}
  />
));
Menubar.displayName = "Menubar";

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    data-slot="menubar-item"
    className={cn(
      "px-3 py-2 rounded-md hover:bg-muted",
      className,
    )}
    {...props}
  />
));
MenubarItem.displayName = "MenubarItem";

export { Menubar, MenubarItem };
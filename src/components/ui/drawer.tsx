"use client";
import * as React from "react";
import * as DrawerPrimitive from "@radix-ui/react-dialog";
import { cn } from "./utils";

const Drawer = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Root>
>((props, ref) => (
  <DrawerPrimitive.Root
    ref={ref}
    data-slot="drawer"
    {...props}
  />
));
Drawer.displayName = "Drawer";

const DrawerTrigger = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Trigger>
>((props, ref) => (
  <DrawerPrimitive.Trigger
    ref={ref}
    data-slot="drawer-trigger"
    {...props}
  />
));
DrawerTrigger.displayName = "DrawerTrigger";

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPrimitive.Content
    ref={ref}
    data-slot="drawer-content"
    className={cn(
      "fixed right-0 top-0 h-full w-80 bg-background shadow-lg p-6",
      className,
    )}
    {...props}
  >
    {children}
  </DrawerPrimitive.Content>
));
DrawerContent.displayName = "DrawerContent";

const DrawerClose = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Close>
>((props, ref) => (
  <DrawerPrimitive.Close
    ref={ref}
    data-slot="drawer-close"
    {...props}
  />
));
DrawerClose.displayName = "DrawerClose";

export { Drawer, DrawerTrigger, DrawerContent, DrawerClose };
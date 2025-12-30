"use client";
import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "./utils";

const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>((props, ref) => (
  <AccordionPrimitive.Root
    ref={ref}
    data-slot="accordion"
    {...props}
  />
));
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>((props, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    data-slot="accordion-item"
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<
    typeof AccordionPrimitive.Trigger
  >
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Trigger
    ref={ref}
    data-slot="accordion-trigger"
    className={cn(
      "flex w-full items-center justify-between py-4 font-medium transition-all",
      className,
    )}
    {...props}
  />
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<
    typeof AccordionPrimitive.Content
  >
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    data-slot="accordion-content"
    className={cn(
      "overflow-hidden text-sm text-muted-foreground",
      className,
    )}
    {...props}
  />
));
AccordionContent.displayName = "AccordionContent";

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
};
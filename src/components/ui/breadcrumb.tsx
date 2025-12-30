"use client";
import * as React from "react";
import * as BreadcrumbPrimitive from "@radix-ui/react-breadcrumbs";
import { cn } from "./utils";

const Breadcrumb = React.forwardRef<
  React.ElementRef<typeof BreadcrumbPrimitive.Root>,
  React.ComponentPropsWithoutRef<
    typeof BreadcrumbPrimitive.Root
  >
>((props, ref) => (
  <BreadcrumbPrimitive.Root
    ref={ref}
    data-slot="breadcrumb"
    {...props}
  />
));
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbItem = React.forwardRef<
  React.ElementRef<typeof BreadcrumbPrimitive.Item>,
  React.ComponentPropsWithoutRef<
    typeof BreadcrumbPrimitive.Item
  >
>((props, ref) => (
  <BreadcrumbPrimitive.Item
    ref={ref}
    data-slot="breadcrumb-item"
    {...props}
  />
));
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<
  React.ElementRef<typeof BreadcrumbPrimitive.Link>,
  React.ComponentPropsWithoutRef<
    typeof BreadcrumbPrimitive.Link
  >
>(({ className, ...props }, ref) => (
  <BreadcrumbPrimitive.Link
    ref={ref}
    data-slot="breadcrumb-link"
    className={cn(
      "text-sm text-primary underline-offset-4 hover:underline",
      className,
    )}
    {...props}
  />
));
BreadcrumbLink.displayName = "BreadcrumbLink";

export { Breadcrumb, BreadcrumbItem, BreadcrumbLink };
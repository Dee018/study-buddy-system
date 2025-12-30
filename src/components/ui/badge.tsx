"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-white",
        success: "bg-emerald-600 text-white",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-border text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span"> & VariantProps<typeof badgeVariants>
>(({ className, variant, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="badge"
    className={cn(badgeVariants({ variant }), className)}
    {...props}
  />
));
Badge.displayName = "Badge";

export { Badge };
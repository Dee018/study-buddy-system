"use client";
import * as React from "react";
import { cn } from "./utils";

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="avatar"
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className,
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ComponentPropsWithoutRef<"img">
>(({ className, ...props }, ref) => (
  <img
    ref={ref}
    data-slot="avatar-image"
    className={cn(
      "aspect-square h-full w-full object-cover",
      className,
    )}
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="avatar-fallback"
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
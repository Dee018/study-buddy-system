"use client";
import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "./utils";
import { buttonVariants } from "./button";

const AlertDialog = React.forwardRef<any, any>((props, ref) => <AlertDialogPrimitive.Root ref={ref} data-slot="alert-dialog" {...props} />);
AlertDialog.displayName = "AlertDialog";

const AlertDialogTrigger = React.forwardRef<any, any>((props, ref) => <AlertDialogPrimitive.Trigger ref={ref} data-slot="alert-dialog-trigger" {...props} />);
AlertDialogTrigger.displayName = "AlertDialogTrigger";

const AlertDialogPortal = React.forwardRef<any, any>((props, ref) => <AlertDialogPrimitive.Portal ref={ref} data-slot="alert-dialog-portal" {...props} />);
AlertDialogPortal.displayName = "AlertDialogPortal";

const AlertDialogOverlay = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    data-slot="alert-dialog-overlay"
    className={cn(
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
      className
    )}
    {...props}
  />
));
AlertDialogOverlay.displayName = "AlertDialogOverlay";

const AlertDialogContent = React.forwardRef<any, any>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      data-slot="alert-dialog-content"
      className={cn(
        "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="alert-dialog-header" className={cn("flex flex-col gap-2 text-center sm:text-left", className)} {...props} />
  )
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="alert-dialog-footer" className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
  )
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<any, any>((props, ref) => <AlertDialogPrimitive.Title ref={ref} data-slot="alert-dialog-title" className={cn("text-lg font-semibold", (props as any).className)} {...props} />);
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef<any, any>((props, ref) => <AlertDialogPrimitive.Description ref={ref} data-slot="alert-dialog-description" className={cn("text-muted-foreground text-sm", (props as any).className)} {...props} />);
AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogAction = React.forwardRef<any, any>((props, ref) => <AlertDialogPrimitive.Action ref={ref} data-slot="alert-dialog-action" className={cn(buttonVariants(), (props as any).className)} {...props} />);
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef<any, any>((props, ref) => <AlertDialogPrimitive.Cancel ref={ref} data-slot="alert-dialog-cancel" className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", (props as any).className)} {...props} />);
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
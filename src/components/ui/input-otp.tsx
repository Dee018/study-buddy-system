"use client";
import * as React from "react";
import { cn } from "./utils";

const InputOTP = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<"input">
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    data-slot="input-otp"
    className={cn(
      "w-12 h-12 text-center border rounded-md text-lg font-medium focus:outline-none focus:ring-1 focus:ring-primary",
      className,
    )}
    {...props}
  />
));
InputOTP.displayName = "InputOTP";

export { InputOTP };
"use client";
import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "./utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>((props, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    data-slot="slider"
    {...props}
  />
));
Slider.displayName = "Slider";

const SliderThumb = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Thumb>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Thumb>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Thumb
    ref={ref}
    data-slot="slider-thumb"
    className={cn(
      "block h-4 w-4 rounded-full bg-primary",
      className,
    )}
    {...props}
  />
));
SliderThumb.displayName = "SliderThumb";

export { Slider, SliderThumb };
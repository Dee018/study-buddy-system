"use client";
import * as React from "react";
import * as CarouselPrimitive from "@radix-ui/react-carousel";

const Carousel = React.forwardRef<
  React.ElementRef<typeof CarouselPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CarouselPrimitive.Root>
>((props, ref) => (
  <CarouselPrimitive.Root
    ref={ref}
    data-slot="carousel"
    {...props}
  />
));
Carousel.displayName = "Carousel";

const CarouselItem = React.forwardRef<
  React.ElementRef<typeof CarouselPrimitive.Slide>,
  React.ComponentPropsWithoutRef<typeof CarouselPrimitive.Slide>
>((props, ref) => (
  <CarouselPrimitive.Slide
    ref={ref}
    data-slot="carousel-item"
    {...props}
  />
));
CarouselItem.displayName = "CarouselItem";

export { Carousel, CarouselItem };
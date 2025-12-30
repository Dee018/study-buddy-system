"use client";
import * as React from "react";
import * as CalendarPrimitive from "@radix-ui/react-calendar";

const Calendar = React.forwardRef<
  React.ElementRef<typeof CalendarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CalendarPrimitive.Root>
>((props, ref) => (
  <CalendarPrimitive.Root
    ref={ref}
    data-slot="calendar"
    {...props}
  />
));
Calendar.displayName = "Calendar";

const CalendarMonth = React.forwardRef<
  React.ElementRef<typeof CalendarPrimitive.Month>,
  React.ComponentPropsWithoutRef<typeof CalendarPrimitive.Month>
>((props, ref) => (
  <CalendarPrimitive.Month
    ref={ref}
    data-slot="calendar-month"
    {...props}
  />
));
CalendarMonth.displayName = "CalendarMonth";

const CalendarDay = React.forwardRef<
  React.ElementRef<typeof CalendarPrimitive.Day>,
  React.ComponentPropsWithoutRef<typeof CalendarPrimitive.Day>
>((props, ref) => (
  <CalendarPrimitive.Day
    ref={ref}
    data-slot="calendar-day"
    {...props}
  />
));
CalendarDay.displayName = "CalendarDay";

export { Calendar, CalendarMonth, CalendarDay };
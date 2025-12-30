// Ambient shims to reduce typing noise for Radix UI variants and versioned react-hook-form imports
declare module '@radix-ui/*' {
  const content: any;
  export = content;
}

declare module '@radix-ui/react-breadcrumbs' {
  const Breadcrumbs: any;
  export const Root: any;
  export const Item: any;
  export const Link: any;
  export default Breadcrumbs;
}

declare module '@radix-ui/react-calendar' {
  const Calendar: any;
  export const Root: any;
  export const Month: any;
  export const Day: any;
  export default Calendar;
}

declare module '@radix-ui/react-carousel' {
  const Carousel: any;
  export const Root: any;
  export const Slide: any;
  export default Carousel;
}

declare module '@radix-ui/react-command' {
  const Command: any;
  export const Root: any;
  export const Input: any;
  export const List: any;
  export default Command;
}

declare module '@radix-ui/react-context-menu' {
  const ContextMenu: any;
  export const Root: any;
  export const Trigger: any;
  export const Group: any;
  export const Portal: any;
  export const Sub: any;
  export const RadioGroup: any;
  export const SubTrigger: any;
  export const SubContent: any;
  export const Content: any;
  export const Item: any;
  export default ContextMenu;
}

// Explicit versioned module name observed in imports
declare module '@radix-ui/react-context-menu@2.2.6' {
  const ContextMenu: any;
  export const Root: any;
  export const Trigger: any;
  export const Group: any;
  export const Portal: any;
  export const Sub: any;
  export const RadioGroup: any;
  export const SubTrigger: any;
  export const SubContent: any;
  export const Content: any;
  export const Item: any;
  export default ContextMenu;
}

// Support import variants that include a version suffix (e.g. @radix-ui/react-context-menu@2.2.6)
declare module '@radix-ui/*@*' {
  const content: any;
  export = content;
}

// Map versioned react-hook-form imports to the installed types
declare module 'react-hook-form@7.55.0' {
  export * from 'react-hook-form';
}

// Generic fallback for sonner and other small UI libs
declare module 'sonner' {
  const content: any;
  export = content;
}

// Recharts and framer-motion shims (if not already present)
declare module 'recharts' {
  const content: any;
  export = content;
}

declare module 'framer-motion' {
  const motion: any;
  export = motion;
}

export { };

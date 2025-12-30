// Lightweight ambient shims for UI libs to reduce TypeScript noise during migration

// Radix UI primitives commonly used across the UI. Mark as `any` to avoid deep typing issues.
declare module '@radix-ui/react-breadcrumbs' { const v: any; export = v }
declare module '@radix-ui/react-calendar' { const v: any; export = v }
declare module '@radix-ui/react-carousel' { const v: any; export = v }
declare module '@radix-ui/react-command' { const v: any; export = v }
declare module '@radix-ui/react-context-menu' { const v: any; export = v }
declare module '@radix-ui/react-dialog' { const v: any; export = v }
declare module '@radix-ui/react-dropdown-menu' { const v: any; export = v }
declare module '@radix-ui/react-popover' { const v: any; export = v }
declare module '@radix-ui/react-select' { const v: any; export = v }
declare module '@radix-ui/react-tooltip' { const v: any; export = v }
declare module '@radix-ui/react-alert-dialog' { const v: any; export = v }

// Broad wildcard for radix packages (versioned and unversioned)
declare module '@radix-ui/*' { const v: any; export = v }
declare module '@radix-ui/*@*' { const v: any; export = v }

// Some imports include explicit versions in the specifier; provide fallbacks
declare module '@radix-ui/react-context-menu@2.2.6' { const v: any; export = v }
declare module '@radix-ui/react-command@*' { const v: any; export = v }

// react-hook-form lightweight shims for the few used exports
declare module 'react-hook-form' {
  export const Controller: any;
  export const FormProvider: any;
  export const useFormContext: any;
  export const useFormState: any;
  export type ControllerProps = any;
  export type FieldPath<T> = any;
  export type FieldValues = any;
}

// Versioned specifier used in some imports
declare module 'react-hook-form@7.55.0' {
  export const Controller: any;
  export const FormProvider: any;
  export const useFormContext: any;
  export const useFormState: any;
  export type ControllerProps = any;
  export type FieldPath<T> = any;
  export type FieldValues = any;
}

declare module 'react-hook-form@*' { const R: any; export = R }

// Sonner variant with versioned specifier used in some files
declare module 'sonner@2.0.3' { const t: any; export = t }
declare module 'sonner@*' { const t: any; export = t }

// Provide minimal JSX namespace to avoid 'Cannot find namespace JSX' in some UI helpers
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Simple ambient shims for Recharts and Framer Motion to reduce typing noise
declare module 'recharts' { const R: any; export = R }
declare module 'recharts/*' { const R: any; export = R }

declare module 'framer-motion' { const M: any; export = M }
declare module 'framer-motion/*' { const M: any; export = M }

export { };

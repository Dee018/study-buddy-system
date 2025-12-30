declare module 'sonner@2.0.3' {
  export const toast: any;
}

declare module 'sonner' {
  export const toast: any;
  export const Toaster: any;
}

// Generic fallback for unusual import specifiers used in Deno/jsr/npm imports
declare module 'npm:*' { const v: any; export default v; }
declare module 'jsr:*' { const v: any; export default v; }

// Specific package specifiers used in imports with version suffixes
declare module 'react-hook-form@7.55.0' {
  const mod: any;
  export = mod;
}

// Allow importing sonner with named Toaster import
declare module 'sonner/*' {
  export const toast: any;
  export const Toaster: any;
}

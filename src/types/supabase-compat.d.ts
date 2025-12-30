// Compatibility augmentations for Supabase/Postgrest typings
// - allow `onConflict` to be string | string[] for .upsert()
// - treat Postgrest builders as thenable/PromiseLike to satisfy wrappers
// - extend PostgrestError with optional `status` field

declare module '@supabase/postgrest-js' {
  // Narrow, permissive Upsert options that accept string | string[] for onConflict
  export interface UpsertOptionsCompat {
    onConflict?: string | string[];
    ignoreDuplicates?: boolean;
    count?: 'exact' | 'planned' | 'estimated';
    defaultToNull?: boolean;
  }

  // Minimal augmentation for PostgrestFilterBuilder to accept UpsertOptionsCompat
  export interface PostgrestFilterBuilder<ClientOptions = any, Schema = any, Row = any, Result = any, RelationName = any, Relationships = any, Method extends string = any> extends PromiseLike<{ data?: any; error?: any }> {
    // allow upsert with compat options (will be merged with existing overloads)
    upsert(values: any, options?: UpsertOptionsCompat): any;
    upsert(values: any[], options?: UpsertOptionsCompat): any;
  }

  // Extend PostgrestError with optional status to match runtime objects used in code
  export interface PostgrestError {
    message?: string;
    details?: any;
    hint?: any;
    code?: string;
    status?: number;
  }
}

// Also augment the supabase-js module surface in case some types surface from there
declare module '@supabase/supabase-js' {
  // Export the same PostgrestFilterBuilder augmentation so callers that import types from supabase-js pick it up
  import { PostgrestFilterBuilder, PostgrestError } from '@supabase/postgrest-js';
  export { PostgrestFilterBuilder, PostgrestError };
}

// Fallback: treat any thenable-like Postgrest builder as PromiseLike globally
declare global {
  interface PromiseLike<T> {
    then: any;
  }
}

// Augment the PostgrestQueryBuilder to accept array form for onConflict as well
declare module '@supabase/postgrest-js' {
  export interface PostgrestQueryBuilder<ClientOptions = any, Schema = any, Relation = any, RelationName = any, Relationships = any> {
    upsert<Row = any>(values: Row, options?: {
      onConflict?: string | string[];
      ignoreDuplicates?: boolean;
      count?: 'exact' | 'planned' | 'estimated';
    }): any;
    upsert<Row = any>(values: Row[], options?: {
      onConflict?: string | string[];
      ignoreDuplicates?: boolean;
      count?: 'exact' | 'planned' | 'estimated';
      defaultToNull?: boolean;
    }): any;
    insert<Row = any>(values: Row | Row[], options?: {
      count?: 'exact' | 'planned' | 'estimated';
      defaultToNull?: boolean;
    }): any;
    update<Row = any>(values: Partial<Row>, options?: {
      count?: 'exact' | 'planned' | 'estimated';
    }): any;
    select(columns?: string, options?: { head?: boolean; count?: 'exact' | 'planned' | 'estimated' }): any;
  }
}

export { };

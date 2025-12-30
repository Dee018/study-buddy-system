// Small internal API type shims to reduce migration typing hotspots

declare global {
  // Keep these permissive — we only need names to satisfy imports/usages.
  type XPSystem = any;
  type ProgressEventType = string | number;
  interface RetryOptions { [key: string]: any }
}

export { };

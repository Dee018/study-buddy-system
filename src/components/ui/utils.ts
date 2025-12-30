// components/ui/utils.tsx
export type ClassValue = string | number | boolean | null | undefined | ClassDictionary | ClassArray;
interface ClassDictionary { [key: string]: any; }
interface ClassArray extends Array<ClassValue> {}

export function cn(...inputs: ClassValue[]): string {
  const result: string[] = [];

  for (const value of inputs) {
    if (!value) continue;

    if (typeof value === "string" || typeof value === "number") {
      result.push(String(value));
    } else if (Array.isArray(value)) {
      const inner = cn(...value);
      if (inner) result.push(inner);
    } else if (typeof value === "object") {
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key) && value[key]) {
          result.push(key);
        }
      }
    }
  }

  return result.join(" ");
}
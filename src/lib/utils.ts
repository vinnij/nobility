import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')       // Replace spaces with underscores
    .replace(/[^\w-]+/g, '')    // Remove all non-word chars
    .replace(/--+/g, '_')       // Replace multiple dashes with single underscore
}

export function hexToNumber(hex: string): number {
  // Remove # if present
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  // Convert hex string to number
  return parseInt(cleanHex, 16);
}
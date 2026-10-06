import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge conditional class names and resolve conflicting Tailwind
 * utility classes (e.g. "px-2" vs "px-4") so the last one wins.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

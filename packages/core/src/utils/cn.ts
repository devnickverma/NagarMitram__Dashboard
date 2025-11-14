import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function to merge class names
 * Combines clsx functionality for conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

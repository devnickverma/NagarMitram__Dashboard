import { useState, useCallback } from 'react';

import type { IUseStorageOptions } from '../types';

/**
 * Custom hook for managing sessionStorage with React state
 * 
 * @param key - The sessionStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @param options - Serialization options
 * @returns [value, setValue, removeValue]
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
  options: IUseStorageOptions = {}
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options;

  // Get initial value from sessionStorage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists to sessionStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to sessionStorage
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, serialize(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, serialize, storedValue]
  );

  // Remove value from sessionStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
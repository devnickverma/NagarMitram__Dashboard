import { useCallback, useState } from 'react';

/**
 * Custom hook for managing boolean toggle state
 * 
 * @param initialValue - Initial boolean value (default: false)
 * @returns [value, toggle, setTrue, setFalse]
 */
export function useToggle(initialValue = false): [
  boolean,
  () => void,
  () => void,
  () => void
] {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback(() => setValue(prev => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, toggle, setTrue, setFalse];
}
import { useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook that returns a function to check if component is still mounted
 * Useful for preventing state updates after component unmounts
 * 
 * @returns Function that returns true if component is mounted
 */
export function useMountedState(): () => boolean {
  const mountedRef = useRef(false);
  const isMounted = useCallback(() => mountedRef.current, []);

  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return isMounted;
}
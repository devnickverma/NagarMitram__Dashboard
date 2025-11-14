import { useEffect, useRef } from 'react';

/**
 * Custom hook that runs an effect only on updates, not on initial mount
 * 
 * @param effect - The effect function to run
 * @param deps - The dependency array
 */
export function useUpdateEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
): void {
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    
    return effect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
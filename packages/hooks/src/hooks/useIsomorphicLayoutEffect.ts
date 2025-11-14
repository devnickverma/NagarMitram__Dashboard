import { useEffect, useLayoutEffect } from 'react';

/**
 * Custom hook that uses useLayoutEffect on the client and useEffect on the server
 * This prevents hydration mismatches in SSR applications
 */
export const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
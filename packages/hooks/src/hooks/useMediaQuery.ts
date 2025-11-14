import { useState, useEffect } from 'react';

import type { IUseMediaQueryOptions } from '../types';

/**
 * Custom hook that tracks a CSS media query
 * 
 * @param query - The media query string
 * @param options - Configuration options
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(
  query: string,
  options: IUseMediaQueryOptions = {}
): boolean {
  const {
    defaultMatches = false,
    matchMedia = typeof window !== 'undefined' ? window.matchMedia : undefined,
  } = options;

  const [matches, setMatches] = useState(() => {
    if (matchMedia) {
      return matchMedia(query).matches;
    }
    return defaultMatches;
  });

  useEffect(() => {
    if (!matchMedia) {
      return;
    }

    const mediaQueryList = matchMedia(query);
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set initial value
    setMatches(mediaQueryList.matches);

    // Listen for changes
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      mediaQueryList.addListener(listener);
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', listener);
      } else {
        // Fallback for older browsers
        mediaQueryList.removeListener(listener);
      }
    };
  }, [query, matchMedia]);

  return matches;
}
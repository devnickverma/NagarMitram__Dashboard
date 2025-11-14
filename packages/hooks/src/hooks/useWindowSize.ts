import { useState, useEffect } from 'react';

import type { IUseWindowSizeOptions } from '../types';

interface IWindowSize {
  width: number;
  height: number;
}

/**
 * Custom hook that tracks window size
 * 
 * @param options - Configuration options
 * @returns Object with current window width and height
 */
export function useWindowSize(options: IUseWindowSizeOptions = {}): IWindowSize {
  const {
    initialWidth = typeof window !== 'undefined' ? window.innerWidth : 1200,
    initialHeight = typeof window !== 'undefined' ? window.innerHeight : 800,
  } = options;

  const [windowSize, setWindowSize] = useState<IWindowSize>({
    width: initialWidth,
    height: initialHeight,
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
}
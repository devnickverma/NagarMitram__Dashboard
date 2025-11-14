/**
 * @de/hooks - React hooks collection for DE frontends
 * 
 * A comprehensive collection of custom React hooks for common patterns
 * and utilities used across DE frontend applications.
 */

// State management hooks
export { useLocalStorage } from './hooks/useLocalStorage';
export { useSessionStorage } from './hooks/useSessionStorage';
export { usePrevious } from './hooks/usePrevious';
export { useToggle } from './hooks/useToggle';

// API and data fetching hooks
export { useApi } from './hooks/useApi';
export { useDebounce } from './hooks/useDebounce';
export { useThrottle } from './hooks/useThrottle';
export { useChatStream } from './hooks/useChatStream';
export type { UseChatStreamOptions, UseChatStreamReturn } from './hooks/useChatStream';

// UI and interaction hooks
export { useClickOutside } from './hooks/useClickOutside';
export { useKeyPress } from './hooks/useKeyPress';
export { useMediaQuery } from './hooks/useMediaQuery';
export { useWindowSize } from './hooks/useWindowSize';

// Utility hooks
export { useIsomorphicLayoutEffect } from './hooks/useIsomorphicLayoutEffect';
export { useMountedState } from './hooks/useMountedState';
export { useUpdateEffect } from './hooks/useUpdateEffect';

// Types
export type * from './types';
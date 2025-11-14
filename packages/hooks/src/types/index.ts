/**
 * Type definitions for hooks package
 */

export interface IUseApiOptions<T = unknown> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retry?: number;
  retryDelay?: number;
}

export interface IUseApiState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface IUseStorageOptions {
  serialize?: (value: unknown) => string;
  deserialize?: (value: string) => unknown;
}

export interface IUseMediaQueryOptions {
  defaultMatches?: boolean;
  matchMedia?: (query: string) => MediaQueryList;
}

export interface IUseWindowSizeOptions {
  initialWidth?: number;
  initialHeight?: number;
}
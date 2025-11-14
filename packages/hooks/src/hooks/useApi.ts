import { useState, useCallback, useRef } from 'react';

import type { IUseApiOptions, IUseApiState } from '../types';

/**
 * Custom hook for API calls with loading, error, and retry logic
 * 
 * @param apiFunction - The async function to call
 * @param options - Configuration options
 * @returns API state and execute function
 */
export function useApi<T = unknown, P extends unknown[] = unknown[]>(
  apiFunction: (...args: P) => Promise<T>,
  options: IUseApiOptions<T> = {}
): IUseApiState<T> & { execute: (...args: P) => Promise<void>; reset: () => void } {
  const {
    initialData = null,
    onSuccess,
    onError,
    retry = 0,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<IUseApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const retryCount = useRef(0);
  const abortController = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (...args: P) => {
      // Cancel previous request if still pending
      if (abortController.current) {
        abortController.current.abort();
      }

      abortController.current = new AbortController();
      retryCount.current = 0;

      const attemptCall = async (): Promise<void> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
          const data = await apiFunction(...args);
          
          if (!abortController.current?.signal.aborted) {
            setState({ data, loading: false, error: null });
            onSuccess?.(data);
          }
        } catch (error) {
          if (!abortController.current?.signal.aborted) {
            const apiError = error instanceof Error ? error : new Error('An error occurred');
            
            if (retryCount.current < retry) {
              retryCount.current++;
              setTimeout(() => {
                if (!abortController.current?.signal.aborted) {
                  attemptCall();
                }
              }, retryDelay);
            } else {
              setState(prev => ({ ...prev, loading: false, error: apiError }));
              onError?.(apiError);
            }
          }
        }
      };

      await attemptCall();
    },
    [apiFunction, onSuccess, onError, retry, retryDelay]
  );

  const reset = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    setState({
      data: initialData,
      loading: false,
      error: null,
    });
    retryCount.current = 0;
  }, [initialData]);

  return {
    ...state,
    execute,
    reset,
  };
}
import { renderHook, act } from '@testing-library/react';

import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    
    expect(result.current).toBe('test');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 500 });
    
    // Should still be initial value
    expect(result.current).toBe('initial');

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should now be updated value
    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    );

    // Change value multiple times rapidly
    rerender({ value: 'change1', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    
    rerender({ value: 'change2', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    
    rerender({ value: 'final', delay: 500 });
    
    // Should still be initial value
    expect(result.current).toBe('initial');

    // Fast forward the full delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should be the final value
    expect(result.current).toBe('final');
  });
});
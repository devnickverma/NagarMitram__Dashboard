import { renderHook, act } from '@testing-library/react';

import { useToggle } from '../useToggle';

describe('useToggle', () => {
  it('should initialize with default value false', () => {
    const { result } = renderHook(() => useToggle());
    const [value] = result.current;
    
    expect(value).toBe(false);
  });

  it('should initialize with provided initial value', () => {
    const { result } = renderHook(() => useToggle(true));
    const [value] = result.current;
    
    expect(value).toBe(true);
  });

  it('should toggle value', () => {
    const { result } = renderHook(() => useToggle(false));
    
    act(() => {
      const [, toggle] = result.current;
      toggle();
    });
    
    expect(result.current[0]).toBe(true);
  });

  it('should set value to true', () => {
    const { result } = renderHook(() => useToggle(false));
    
    act(() => {
      const [, , setTrue] = result.current;
      setTrue();
    });
    
    expect(result.current[0]).toBe(true);
  });

  it('should set value to false', () => {
    const { result } = renderHook(() => useToggle(true));
    
    act(() => {
      const [, , , setFalse] = result.current;
      setFalse();
    });
    
    expect(result.current[0]).toBe(false);
  });
});
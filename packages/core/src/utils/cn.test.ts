import { describe, it, expect } from 'vitest';

import { cn } from './cn';

describe('cn utility', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('should handle undefined values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar');
  });

  it('should handle empty strings', () => {
    expect(cn('', 'foo', '')).toBe('foo');
  });
});

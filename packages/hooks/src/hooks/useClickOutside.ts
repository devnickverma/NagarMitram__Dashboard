import { useEffect, useRef } from 'react';

/**
 * Custom hook that handles click outside of a referenced element
 * 
 * @param handler - Function to call when clicking outside
 * @param events - Array of events to listen for (default: ['mousedown', 'touchstart'])
 * @returns Ref to attach to the element
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: Event) => void,
  events: string[] = ['mousedown', 'touchstart']
): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const listener = (event: Event) => {
      const element = ref.current;
      
      if (!element || element.contains(event.target as Node)) {
        return;
      }
      
      handler(event);
    };

    events.forEach(event => {
      document.addEventListener(event, listener);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, listener);
      });
    };
  }, [handler, events]);

  return ref;
}
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

type IssuesChangePayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE' | string;
  new?: any;
  old?: any;
};

export function useRealtimeIssues(onEvent: (evt: IssuesChangePayload) => void) {
  // Keep latest callback without changing effect dependencies
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const handleUpdate = useCallback(() => {
    console.log('🔄 Real-time update triggered - refreshing data...');
    // Backward safety: no-op here; we use the payload callback below
  }, []);

  useEffect(() => {
    console.log('📡 Setting up real-time subscription for issues table...');

    // Subscribe to all changes on the issues table
    const channelName = 'issues-changes';
    // Prevent duplicate subscriptions in dev (React StrictMode double-mount)
    const existing = (supabase as any).getChannels?.()
      ?.find((ch: any) => ch?.topic === channelName);
    if (existing) {
      try {
        console.log('♻️ Removing existing channel to avoid duplicates:', channelName);
        supabase.removeChannel(existing);
      } catch (e) {
        console.warn('Could not remove existing channel:', e);
      }
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'issues'
        },
        (payload) => {
          console.log('✅ Real-time change detected:', payload.eventType, payload);
          onEventRef.current?.({
            eventType: payload.eventType as any,
            new: (payload as any).new,
            old: (payload as any).old,
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔌 Cleaning up real-time subscription...');
      supabase.removeChannel(channel);
    };
  }, []);
}

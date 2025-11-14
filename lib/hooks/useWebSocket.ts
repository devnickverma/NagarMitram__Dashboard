import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';

interface Message {
  type: string;
  data: any;
  timestamp: Date;
}

export function useWebSocket(url?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Use Supabase real-time instead of WebSocket
    const channelName = 'realtime-issues';
    const existing = (supabase as any).getChannels?.()
      ?.find((ch: any) => ch?.topic === channelName);
    if (existing) {
      try {
        supabase.removeChannel(existing);
      } catch {}
    }

    const subscription = supabase
      .channel(channelName)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'issues' 
      }, (payload) => {
        setMessages(prev => [...prev, {
          type: 'new_issue',
          data: payload.new,
          timestamp: new Date(),
        }]);
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'issues' 
      }, (payload) => {
        setMessages(prev => [...prev, {
          type: 'issue_updated',
          data: payload.new,
          timestamp: new Date(),
        }]);
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const sendMessage = useCallback((message: any) => {
    // Not needed with Supabase real-time
    console.log('Message would be sent:', message);
  }, []);

  return {
    isConnected,
    messages,
    sendMessage,
  };
}
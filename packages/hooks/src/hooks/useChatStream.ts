'use client';

import { useState, useCallback } from 'react';

interface IMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UseChatStreamOptions {
  apiEndpoint?: string;
  onError?: (error: string) => void;
  onStreamStart?: () => void;
  onStreamEnd?: () => void;
}

export interface UseChatStreamReturn {
  messages: IMessage[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

export function useChatStream(options: UseChatStreamOptions = {}): UseChatStreamReturn {
  const { 
    apiEndpoint = '/api/chat',
    onError,
    onStreamStart,
    onStreamEnd 
  } = options;

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      // Add user message
      const userMessage: IMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setError(null);
      onStreamStart?.();

      // Create assistant message placeholder
      const assistantMessage: IMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
          }),
        });

        if (!response.ok) throw new Error('Failed to send message');

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');

        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
          const result = await reader.read();
          done = result.done;
          if (done) break;

          const value = result.value;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter((line) => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'token') {
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastMessage = updated[updated.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content += data.content;
                  }
                  return updated;
                });
              } else if (data.type === 'error') {
                const errorMsg = data.error;
                setError(errorMsg);
                onError?.(errorMsg);
              }
            }
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setIsStreaming(false);
        onStreamEnd?.();
      }
    },
    [messages, apiEndpoint, onError, onStreamStart, onStreamEnd]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    clearMessages,
  };
}
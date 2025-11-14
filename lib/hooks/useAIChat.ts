import { useState, useCallback } from 'react';
import axios from 'axios';

interface ChatMessage {
  message: string;
  context: any;
  executeAction?: any;
}

interface ChatResponse {
  response: string;
  suggested_actions?: any[];
  context_updates?: any;
  action_required?: any;
  success?: boolean;
}

export function useAIChat() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (chatMessage: ChatMessage): Promise<ChatResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/ai/chat', chatMessage);
      return response.data;
    } catch (err: any) {
      // Fallback to mock response if API fails
      console.error('AI Chat API error:', err);
      
      // Generate mock AI response
      const mockResponses = [
        {
          response: "Based on the current data, I've identified 3 critical issues in the Downtown District that require immediate attention. The pothole on Main Street has a severity score of 9.2/10 and should be prioritized.",
          suggested_actions: [
            { type: 'assign', label: 'Assign Team B', assignee: 'Team B', issueId: '1284' },
            { type: 'prioritize', label: 'Mark as Critical', priority: 'critical', issueId: '1284' },
          ],
        },
        {
          response: "Resource allocation analysis shows Team A is currently at 80% capacity while Team C is at 40%. I recommend redistributing the workload for optimal efficiency.",
          suggested_actions: [
            { type: 'reassign', label: 'Reassign Tasks', from: 'Team A', to: 'Team C' },
          ],
        },
        {
          response: "Pattern analysis reveals a 35% increase in road-related issues this week, primarily concentrated in the Downtown and West Side districts. This may be due to recent weather conditions.",
          suggested_actions: [
            { type: 'alert', label: 'Issue Weather Advisory', severity: 'medium' },
          ],
        },
      ];

      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      setError('Using mock response - API unavailable');
      return randomResponse;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sendMessage,
    isLoading,
    error,
  };
}
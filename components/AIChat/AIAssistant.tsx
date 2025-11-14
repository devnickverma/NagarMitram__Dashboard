'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { useAIChat } from '@/lib/hooks/useAIChat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  context: any;
  onActionSuggested: (action: any) => void;
}

export default function AIAssistant({ context, onActionSuggested }: AIAssistantProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { sendMessage, isLoading } = useAIChat();

  useEffect(() => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'AI Assistant ready. How can I help you manage issues today?',
      timestamp: new Date(),
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await sendMessage({
        message: input,
        context: context,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      if (response.suggested_actions?.length > 0) {
        response.suggested_actions.forEach((action: any) => {
          setTimeout(() => onActionSuggested(action), 500);
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Error processing request. Please try again.',
        timestamp: new Date(),
      }]);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
          AI Assistant
        </Typography>
      </Box>

      {/* Messages */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
        backgroundColor: '#fafafa',
      }}>
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              mb: 2,
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                maxWidth: '80%',
                backgroundColor: message.role === 'user' ? '#ffffff' : '#f5f5f5',
                border: '1px solid #e0e0e0',
                borderRadius: 1,
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#757575',
                  fontSize: 11,
                  display: 'block',
                  mb: 0.5
                }}
              >
                {message.role === 'user' ? 'You' : 'AI'}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#424242',
                  fontSize: 13,
                  lineHeight: 1.5
                }}
              >
                {message.content}
              </Typography>
            </Paper>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#ffffff',
      }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={isLoading}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 14,
                borderRadius: 1,
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#bdbdbd',
                },
              },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            sx={{
              backgroundColor: '#1a1a1a',
              color: 'white',
              borderRadius: 1,
              '&:hover': {
                backgroundColor: '#424242',
              },
              '&:disabled': {
                backgroundColor: '#e0e0e0',
                color: '#bdbdbd',
              },
            }}
          >
            <Send sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
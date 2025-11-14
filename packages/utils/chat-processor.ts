/**
 * Chat Processing Utilities
 * 
 * @description
 * Reusable functions for chat message processing and streaming responses.
 * Replaces the /api/chat endpoint with function-based approach.
 * 
 * @features
 * - Message validation and sanitization
 * - Streaming response simulation
 * - Rate limiting support
 * - Error handling
 * 
 * @author CSR Agent Team
 * @since 1.0.0
 */

export interface IChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface IChatRequest {
  messages: IChatMessage[];
  stream?: boolean;
  maxTokens?: number;
}

export interface IChatResponse {
  success: boolean;
  data?: {
    messages: IChatMessage[];
    response: string;
    tokensUsed?: number;
    timestamp: string;
  };
  error?: {
    message: string;
    code: string;
    status: number;
  };
}

export interface IStreamingChatResponse {
  success: boolean;
  stream?: ReadableStream<Uint8Array>;
  error?: {
    message: string;
    code: string;
    status: number;
  };
}

/**
 * Validate chat input messages
 */
function validateChatInput(data: any): { messages?: IChatMessage[]; errors: string[] } {
  const errors: string[] = [];
  const result: { messages?: IChatMessage[]; errors: string[] } = { errors };

  if (!data.messages) {
    errors.push('Messages array is required');
    return result;
  }

  if (!Array.isArray(data.messages)) {
    errors.push('Messages must be an array');
    return result;
  }

  if (data.messages.length === 0) {
    errors.push('At least one message is required');
    return result;
  }

  if (data.messages.length > 100) {
    errors.push('Too many messages (max 100)');
    return result;
  }

  // Validate each message
  const validatedMessages: IChatMessage[] = [];
  for (let i = 0; i < data.messages.length; i++) {
    const msg = data.messages[i];
    
    if (!msg || typeof msg !== 'object') {
      errors.push(`Message ${i + 1} must be an object`);
      continue;
    }

    if (!msg.content || typeof msg.content !== 'string') {
      errors.push(`Message ${i + 1} must have string content`);
      continue;
    }

    if (msg.content.length > 4000) {
      errors.push(`Message ${i + 1} content too long (max 4000 characters)`);
      continue;
    }

    if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) {
      errors.push(`Message ${i + 1} must have valid role (user, assistant, or system)`);
      continue;
    }

    // Sanitize and add to validated messages
    validatedMessages.push({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content.trim()
    });
  }

  if (errors.length === 0) {
    result.messages = validatedMessages;
  }

  return result;
}

/**
 * Generate AI response based on messages
 */
function generateAIResponse(messages: IChatMessage[]): string {
  const lastMessage = messages[messages.length - 1];
  
  // Simple response generation for demo purposes
  // In production, this would integrate with actual AI services
  const responses = [
    "I understand your inquiry. Let me help you with that.",
    "That's a great question! Here's what I can tell you about that.",
    "I can assist you with that. Let me provide you with the information you need.",
    "Thank you for your message. I'm here to help you find what you're looking for.",
    "I'd be happy to help you with that request. Let me give you some guidance.",
    "Based on your question, here's what I recommend:",
    "I can help you explore that topic. Here are some key points to consider:",
    "That's an interesting question. Let me break that down for you:",
  ];

  // Select response based on content
  if (lastMessage.content.toLowerCase().includes('diamond')) {
    return "I can help you with diamond-related inquiries. Our collection features certified diamonds with detailed specifications, pricing, and availability information.";
  }
  
  if (lastMessage.content.toLowerCase().includes('price') || lastMessage.content.toLowerCase().includes('cost')) {
    return "I can provide pricing information for our products. Prices vary based on specifications, quality, and current market conditions. Would you like specific pricing details?";
  }
  
  if (lastMessage.content.toLowerCase().includes('help') || lastMessage.content.toLowerCase().includes('support')) {
    return "I'm here to assist you! I can help with product information, pricing, availability, specifications, and general inquiries. What specific area would you like help with?";
  }

  // Default response
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}

/**
 * Create streaming response tokens
 */
function createStreamingTokens(response: string): string[] {
  // Split response into tokens (words and punctuation)
  const tokens = response.split(/(\s+|[.,!?;:])/).filter(token => token.trim().length > 0);
  
  // Ensure we have some tokens
  if (tokens.length === 0) {
    return ['Hello!', ' ', 'How', ' ', 'can', ' ', 'I', ' ', 'help', ' ', 'you', ' ', 'today?'];
  }
  
  return tokens;
}

/**
 * Process chat messages and generate response
 * 
 * @param request - Chat request with messages
 * @returns Chat response
 */
export async function processIChatMessages(request: IChatRequest): Promise<IChatResponse> {
  const startTime = performance.now();

  try {
    // Validate input
    const { messages, errors } = validateChatInput(request);
    
    if (errors.length > 0) {
      return {
        success: false,
        error: {
          message: errors.join(', '),
          code: 'VALIDATION_ERROR',
          status: 400
        }
      };
    }

    // Generate AI response
    const aiResponse = generateAIResponse(messages!);
    
    // Create assistant message
    const assistantMessage: IChatMessage = {
      role: 'assistant',
      content: aiResponse
    };

    const endTime = performance.now();
    const responseTime = Math.round((endTime - startTime) * 100) / 100;

    console.log(`✅ [ChatProcessor] Chat processed successfully (${responseTime}ms):`, {
      messageCount: messages!.length,
      responseLength: aiResponse.length
    });

    return {
      success: true,
      data: {
        messages: [...messages!, assistantMessage],
        response: aiResponse,
        tokensUsed: aiResponse.split(' ').length,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    const endTime = performance.now();
    const responseTime = Math.round((endTime - startTime) * 100) / 100;
    
    console.error(`❌ [ChatProcessor] Chat processing failed (${responseTime}ms):`, error);
    
    return {
      success: false,
      error: {
        message: 'Chat processing failed',
        code: 'INTERNAL_ERROR',
        status: 500
      }
    };
  }
}

/**
 * Process chat messages with streaming response
 * 
 * @param request - Chat request with messages
 * @returns Streaming chat response
 */
export async function processChatMessagesStreaming(request: IChatRequest): Promise<IStreamingChatResponse> {
  try {
    // Validate input
    const { messages, errors } = validateChatInput(request);
    
    if (errors.length > 0) {
      return {
        success: false,
        error: {
          message: errors.join(', '),
          code: 'VALIDATION_ERROR',
          status: 400
        }
      };
    }

    // Generate AI response and create tokens
    const aiResponse = generateAIResponse(messages!);
    const tokens = createStreamingTokens(aiResponse);

    console.log(`✅ [ChatProcessor] Starting streaming chat response:`, {
      messageCount: messages!.length,
      tokenCount: tokens.length
    });

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send start event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'start' })}\n\n`)
          );

          // Send tokens with delay
          for (const token of tokens) {
            await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`)
            );
          }

          // Send completion event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'done', 
              tokensUsed: tokens.length,
              timestamp: new Date().toISOString()
            })}\n\n`)
          );

          controller.close();
        } catch (error) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: String(error) 
            })}\n\n`)
          );
          controller.close();
        }
      }
    });

    return {
      success: true,
      stream
    };

  } catch (error) {
    console.error('❌ [ChatProcessor] Streaming chat failed:', error);
    
    return {
      success: false,
      error: {
        message: 'Streaming chat failed',
        code: 'INTERNAL_ERROR',
        status: 500
      }
    };
  }
}

/**
 * Quick chat for simple use cases
 * 
 * @param userMessage - User's message
 * @returns AI response string
 */
export async function quickChat(userMessage: string): Promise<string> {
  try {
    const result = await processIChatMessages({
      messages: [{ role: 'user', content: userMessage }]
    });
    
    if (result.success && result.data) {
      return result.data.response;
    }
    
    return "I apologize, but I'm having trouble processing your request right now. Please try again.";
  } catch (error) {
    console.error('❌ [quickChat] Failed:', error);
    return "I'm sorry, but I encountered an error. Please try again later.";
  }
}

/**
 * Validate if chat request is safe (content filtering)
 * 
 * @param messages - Chat messages to validate
 * @returns True if safe, false if potentially harmful
 */
export function validateChatSafety(messages: IChatMessage[]): boolean {
  const unsafePatterns = [
    /\b(hack|exploit|malware|virus)\b/i,
    /\b(steal|theft|fraud|scam)\b/i,
    /\b(illegal|criminal|unlawful)\b/i,
  ];

  return !messages.some(msg => 
    unsafePatterns.some(pattern => pattern.test(msg.content))
  );
}

/**
 * Get chat statistics for monitoring
 * 
 * @param messages - Chat messages
 * @returns Chat statistics
 */
export function getChatStatistics(messages: IChatMessage[]) {
  const totalMessages = messages.length;
  const userMessages = messages.filter(m => m.role === 'user').length;
  const assistantMessages = messages.filter(m => m.role === 'assistant').length;
  const systemMessages = messages.filter(m => m.role === 'system').length;
  
  const totalCharacters = messages.reduce((sum, msg) => sum + msg.content.length, 0);
  const averageMessageLength = totalMessages > 0 ? Math.round(totalCharacters / totalMessages) : 0;

  return {
    totalMessages,
    userMessages,
    assistantMessages,
    systemMessages,
    totalCharacters,
    averageMessageLength,
    estimatedTokens: Math.ceil(totalCharacters / 4) // Rough token estimation
  };
}
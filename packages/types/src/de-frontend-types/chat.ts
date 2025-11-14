/**
 * Chat API Integration
 * Handles AI chat with automatic handoff to Freshchat when needed
 * Manages conversation state and routing between AI and human agents
 */

import {
  IChatRequest,
  IChatResponse,
  IConversationMapping
} from './types';

import { 
  sendFreshchatMessage,
  getFreshchatConversation 
} from './freshchat';

/**
 * Chat API Client Class
 */
export class ChatAPI {
  private baseURL: string;

  constructor(baseURL: string = '') {
    // Base URL will be determined dynamically or from environment
    this.baseURL = baseURL;
  }

  /**
   * Get headers for chat API requests with optional auth_token
   */
  private getHeaders(authToken?: string): HeadersInit {
    const headers: HeadersInit = {
      'accept': 'application/json',
      'Content-Type': 'application/json'
    };
    
    // Only add Authorization header if auth token is provided
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return headers;
  }

  /**
   * Send a chat message - handles both AI chat and Freshchat handoff
   */
  async sendMessage(
    chatRequest: IChatRequest,
    apiBaseURL?: string
  ): Promise<IChatResponse | { success: false; message: string; error_details?: any }> {
    try {
      // Check if conversation is already handed off to human
      const conversationState = this.getConversationState(chatRequest.session_id);
      
      if (conversationState?.handoff_to_human) {
        // Route to Freshchat if already handed off to human
        return await this.handleFreshchatMessage(chatRequest, conversationState);
      }

      // Use provided API base URL or construct from current location
      const baseUrl = apiBaseURL || this.getApiBaseURL();
      
      // Validate required fields
      if (!chatRequest.message) {
        return {
          success: false,
          message: 'Missing required field: message'
        };
      }

      if (!chatRequest.user_id) {
        return {
          success: false,
          message: 'Missing required field: user_id'
        };
      }

      if (!chatRequest.session_id) {
        return {
          success: false,
          message: 'Missing required field: session_id'
        };
      }

      // Auth token is now optional for development/demo purposes
      if (!chatRequest.auth_token) {
        console.warn('⚠️ No auth_token provided - using demo mode');
        chatRequest.auth_token = 'demo_token';
      }

      // Make API call to chat endpoint
      const response = await fetch(`${baseUrl}/api/v1/chat`, {
        method: 'POST',
        headers: this.getHeaders(chatRequest.auth_token),
        body: JSON.stringify({
          message: chatRequest.message,
          user_id: chatRequest.user_id,
          session_id: chatRequest.session_id,
          stream: chatRequest.stream || false,
          auth_token: chatRequest.auth_token,
          metadata: chatRequest.metadata || {}
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Chat API error:', data);
        return {
          success: false,
          message: 'Failed to send chat message',
          error_details: {
            status: response.status,
            statusText: response.statusText,
            data
          }
        };
      }

      // Store conversation mapping and check for handoff
      await this.handleChatResponse(data);

      return data;

    } catch (error) {
      console.error('Error sending chat message:', error);
      return {
        success: false,
        message: 'Internal error while sending chat message',
        error_details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Handle chat response - store conversation mapping and check handoff status
   */
  private async handleChatResponse(chatResponse: IChatResponse): Promise<void> {
    try {
      // Extract conversation details
      const freshchatConversationId = chatResponse.metadata?.freshchat_conversation_id;
      const handoffToHuman = chatResponse.handoff_to_human;

      if (freshchatConversationId) {
        // Store or update conversation mapping
        const conversationMapping: IConversationMapping = {
          session_id: chatResponse.session_id,
          conversation_id: chatResponse.conversation_id,
          freshchat_conversation_id: freshchatConversationId,
          user_id: chatResponse.user_id,
          handoff_to_human: handoffToHuman,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message_timestamp: chatResponse.timestamp
        };

        this.storeConversationMapping(conversationMapping);

        console.log(`📞 Conversation mapping stored:`, {
          session_id: chatResponse.session_id,
          conversation_id: chatResponse.conversation_id,
          freshchat_conversation_id: freshchatConversationId,
          handoff_to_human: handoffToHuman
        });

        // If handoff to human is true, log the transition
        if (handoffToHuman) {
          console.log(`🤝 Conversation ${chatResponse.conversation_id} handed off to human agent`);
          console.log(`   - Freshchat Conversation ID: ${freshchatConversationId}`);
          console.log(`   - Future messages will route to Freshchat`);
        }
      }
    } catch (error) {
      console.error('Error handling chat response:', error);
    }
  }

  /**
   * Handle message routing to Freshchat when handed off to human
   */
  private async handleFreshchatMessage(
    chatRequest: IChatRequest,
    conversationState: IConversationMapping
  ): Promise<IChatResponse | { success: false; message: string; error_details?: any }> {
    try {
      console.log(`🤝 Routing message to Freshchat for conversation ${conversationState.conversation_id}`);

      // Get the user's Freshchat user ID (assuming it's stored or can be retrieved)
      const freshchatUserId = this.getFreshchatUserIdForSession(chatRequest.session_id);
      
      if (!freshchatUserId) {
        return {
          success: false,
          message: 'No Freshchat user ID found for this session',
          error_details: { session_id: chatRequest.session_id }
        };
      }

      // Send message to Freshchat
      const freshchatResponse = await sendFreshchatMessage(
        conversationState.freshchat_conversation_id,
        chatRequest.message,
        freshchatUserId,
        chatRequest.auth_token // Use auth_token as actor_id for now
      );

      if (freshchatResponse.success) {
        // Get the updated conversation from Freshchat to get the response
        const conversationData = await getFreshchatConversation(
          conversationState.freshchat_conversation_id
        );

        if (conversationData.success && conversationData.conversation_data) {
          // Extract the latest message from the conversation
          const messages = conversationData.conversation_data.messages || [];
          const latestMessage = messages[messages.length - 1];
          const responseText = latestMessage?.message_parts?.[0]?.text?.content || 'Message sent to human agent';

          // Construct a chat response that matches the expected format
          const mockChatResponse: IChatResponse = {
            response: responseText,
            display_items: {},
            handoff_to_human: true,
            session_id: chatRequest.session_id,
            conversation_id: conversationState.conversation_id,
            user_id: chatRequest.user_id,
            billing_session_count: 1,
            is_new_session: false,
            timestamp: new Date().toISOString(),
            metadata: {
              freshchat_conversation_id: conversationState.freshchat_conversation_id,
              agent_state: {
                messages: [],
                user_id: chatRequest.user_id,
                session_id: chatRequest.session_id,
                auth_token: chatRequest.auth_token,
                conversation_id: conversationState.conversation_id,
                conversation_context: {
                  conversation_id: conversationState.conversation_id,
                  session_data: {
                    session_id: chatRequest.session_id,
                    user_id: chatRequest.user_id,
                    user_name: '',
                    user_email: '',
                    status: 'active',
                    billing_session_count: 1,
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    created_at: conversationState.created_at,
                    updated_at: new Date().toISOString(),
                    metadata: {
                      auth_token: chatRequest.auth_token
                    }
                  },
                  freshchat_conversation_id: conversationState.freshchat_conversation_id,
                  last_response_timestamp: new Date().toISOString(),
                  model_used: 'human_agent'
                },
                display_items: {},
                handoff_to_human: true
              }
            }
          };

          return mockChatResponse;
        }
      }

      return {
        success: false,
        message: 'Failed to send message via Freshchat',
        error_details: freshchatResponse
      };

    } catch (error) {
      console.error('Error handling Freshchat message:', error);
      return {
        success: false,
        message: 'Error routing message to human agent',
        error_details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Send a simplified chat message
   */
  async sendSimpleMessage(
    message: string,
    userId: string,
    sessionId: string,
    authToken: string,
    metadata?: { [key: string]: any },
    stream?: boolean,
    apiBaseURL?: string
  ): Promise<IChatResponse | { success: false; message: string; error_details?: any }> {
    const chatRequest: IChatRequest = {
      message,
      user_id: userId,
      session_id: sessionId,
      stream: stream || false,
      auth_token: authToken,
      metadata: metadata || {}
    };

    return this.sendMessage(chatRequest, apiBaseURL);
  }

  /**
   * Get API base URL for services API (different from local origin)
   */
  private getApiBaseURL(): string {
    // Services API is running on a different server
    return process.env.NEXT_PUBLIC_SERVICES_API_URL || 'http://192.168.50.19:8000';
  }

  /**
   * Store conversation mapping in localStorage
   */
  private storeConversationMapping(mapping: IConversationMapping): void {
    if (typeof window === 'undefined') return;

    try {
      const mappingKey = `conversation_mapping_${mapping.session_id}`;
      localStorage.setItem(mappingKey, JSON.stringify(mapping));

      // Also store by conversation_id for quick lookup
      const conversationKey = `conversation_${mapping.conversation_id}`;
      localStorage.setItem(conversationKey, JSON.stringify(mapping));

      // Store freshchat conversation mapping
      const freshchatKey = `freshchat_conversation_${mapping.freshchat_conversation_id}`;
      localStorage.setItem(freshchatKey, JSON.stringify(mapping));

    } catch (error) {
      console.error('Error storing conversation mapping:', error);
    }
  }

  /**
   * Get conversation state from localStorage
   */
  private getConversationState(sessionId: string): IConversationMapping | null {
    if (typeof window === 'undefined') return null;

    try {
      const mappingKey = `conversation_mapping_${sessionId}`;
      const storedData = localStorage.getItem(mappingKey);

      if (storedData) {
        return JSON.parse(storedData);
      }

      return null;
    } catch (error) {
      console.error('Error retrieving conversation state:', error);
      return null;
    }
  }

  /**
   * Get Freshchat user ID for a session (placeholder - implement based on your storage strategy)
   */
  private getFreshchatUserIdForSession(sessionId: string): string | null {
    if (typeof window === 'undefined') return null;

    try {
      // Try to get from session mapping or user data
      // This is a placeholder - you may need to implement based on how you store user data
      const sessionData = localStorage.getItem(`session_mapping_${sessionId}`);
      if (sessionData) {
        const userId = JSON.parse(sessionData);
        
        // Try to get freshchat user ID from internal user data
        const userIds = this.getUserIdsByUserId(userId);
        return userIds.freshchat_user_id;
      }

      // Fallback: try to get the last created freshchat user ID
      return localStorage.getItem('internal_last_created_freshchat_user') || 
             localStorage.getItem('last_created_freshchat_user');

    } catch (error) {
      console.error('Error getting Freshchat user ID for session:', error);
      return null;
    }
  }

  /**
   * Helper to get user IDs by user ID (placeholder - implement based on your storage)
   */
  private getUserIdsByUserId(userId: string): { user_id: string | null, freshchat_user_id: string | null } {
    if (typeof window === 'undefined') return { user_id: null, freshchat_user_id: null };

    try {
      // Check user-freshchat mapping
      const mappingKey = `user_freshchat_mapping_${userId}`;
      const freshchatUserId = localStorage.getItem(mappingKey);

      return {
        user_id: userId,
        freshchat_user_id: freshchatUserId
      };
    } catch (error) {
      console.error('Error getting user IDs:', error);
      return { user_id: null, freshchat_user_id: null };
    }
  }
}

// Default instance
export const chatAPI = new ChatAPI();

// Individual functions for easier imports
export const sendChatMessage = (
  chatRequest: IChatRequest,
  apiBaseURL?: string
) => chatAPI.sendMessage(chatRequest, apiBaseURL);

export const sendSimpleChatMessage = (
  message: string,
  userId: string,
  sessionId: string,
  authToken: string,
  metadata?: { [key: string]: any },
  stream?: boolean,
  apiBaseURL?: string
) => chatAPI.sendSimpleMessage(message, userId, sessionId, authToken, metadata, stream, apiBaseURL);

/**
 * LocalStorage Management Functions for Conversations
 */

/**
 * Get conversation mapping by session ID
 */
export const getConversationMapping = (sessionId: string): IConversationMapping | null => {
  if (typeof window === 'undefined') return null;

  try {
    const mappingKey = `conversation_mapping_${sessionId}`;
    const storedData = localStorage.getItem(mappingKey);

    if (storedData) {
      return JSON.parse(storedData);
    }

    return null;
  } catch (error) {
    console.error('Error retrieving conversation mapping:', error);
    return null;
  }
};

/**
 * Get conversation mapping by conversation ID
 */
export const getConversationMappingByConversationId = (conversationId: string): IConversationMapping | null => {
  if (typeof window === 'undefined') return null;

  try {
    const conversationKey = `conversation_${conversationId}`;
    const storedData = localStorage.getItem(conversationKey);

    if (storedData) {
      return JSON.parse(storedData);
    }

    return null;
  } catch (error) {
    console.error('Error retrieving conversation mapping by conversation ID:', error);
    return null;
  }
};

/**
 * Get conversation mapping by Freshchat conversation ID
 */
export const getConversationMappingByFreshchatId = (freshchatConversationId: string): IConversationMapping | null => {
  if (typeof window === 'undefined') return null;

  try {
    const freshchatKey = `freshchat_conversation_${freshchatConversationId}`;
    const storedData = localStorage.getItem(freshchatKey);

    if (storedData) {
      return JSON.parse(storedData);
    }

    return null;
  } catch (error) {
    console.error('Error retrieving conversation mapping by Freshchat ID:', error);
    return null;
  }
};

/**
 * Get all conversation mappings
 */
export const getAllConversationMappings = (): IConversationMapping[] => {
  if (typeof window === 'undefined') return [];

  try {
    const mappings = [];
    const keys = Object.keys(localStorage);

    for (const key of keys) {
      if (key.startsWith('conversation_mapping_')) {
        const mappingData = localStorage.getItem(key);
        if (mappingData) {
          mappings.push(JSON.parse(mappingData));
        }
      }
    }

    return mappings;
  } catch (error) {
    console.error('Error retrieving all conversation mappings:', error);
    return [];
  }
};

/**
 * Check if conversation is handed off to human
 */
export const isConversationHandedOffToHuman = (sessionId: string): boolean => {
  const mapping = getConversationMapping(sessionId);
  return mapping?.handoff_to_human || false;
};

/**
 * Clear conversation mapping
 */
export const clearConversationMapping = (sessionId: string): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const mapping = getConversationMapping(sessionId);
    if (mapping) {
      // Remove all related mappings
      localStorage.removeItem(`conversation_mapping_${sessionId}`);
      localStorage.removeItem(`conversation_${mapping.conversation_id}`);
      localStorage.removeItem(`freshchat_conversation_${mapping.freshchat_conversation_id}`);

      console.log(`🗑️ Cleared conversation mapping for session: ${sessionId}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error clearing conversation mapping:', error);
    return false;
  }
};

/**
 * Clear all conversation mappings
 */
export const clearAllConversationMappings = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const keys = Object.keys(localStorage);
    let removedCount = 0;

    for (const key of keys) {
      if (key.startsWith('conversation_mapping_') || 
          key.startsWith('conversation_') || 
          key.startsWith('freshchat_conversation_')) {
        localStorage.removeItem(key);
        removedCount++;
      }
    }

    console.log(`🗑️ Cleared ${removedCount} conversation mappings`);
    return true;
  } catch (error) {
    console.error('Error clearing all conversation mappings:', error);
    return false;
  }
};
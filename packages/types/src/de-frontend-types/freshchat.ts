/**
 * Freshchat API Integration
 * Handles user creation and management in Freshchat
 */

import {
  IFreshchatUserRequest,
  IFreshchatUserResponse,
  IFreshchatAPIPayload,
  IFreshchatUser,
  IFreshchatUsersResponse,
  IFreshchatProperty,
  IFreshchatSendMessageRequest,
  IFreshchatSendMessageResponse,
  IFreshchatConversation,
  IFreshchatGetConversationResponse
} from './types';

// Freshchat Configuration - Now using environment variables
const FRESHCHAT_BASE_URL = process.env.NEXT_PUBLIC_FRESHCHAT_BASE_URL || 'https://ashi-860828023240121150-bf24686de08d2d817516021.freshchat.com/v2';
const FRESHCHAT_TOKEN = process.env.FRESHCHAT_TOKEN || process.env.NEXT_PUBLIC_FRESHCHAT_TOKEN || '';

/**
 * Freshchat API Client Class
 */
export class FreshchatAPI {
  private baseURL: string;
  private token: string;

  constructor(baseURL: string = FRESHCHAT_BASE_URL, token: string = FRESHCHAT_TOKEN) {
    this.baseURL = baseURL;
    this.token = token;
  }

  /**
   * Get default headers for Freshchat API requests
   */
  private getHeaders(assumeIdentity: boolean = false): HeadersInit {
    return {
      'accept': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'ASSUME-IDENTITY': assumeIdentity.toString()
    };
  }

  /**
   * Create a new user in Freshchat
   */
  async createUser(userRequest: IFreshchatUserRequest): Promise<IFreshchatUserResponse> {
    try {
      // Validate required fields
      const requiredFields = ['email', 'first_name', 'last_name', 'reference_id', 'jeweler_id'];
      for (const field of requiredFields) {
        if (!userRequest[field as keyof IFreshchatUserRequest]) {
          return {
            success: false,
            message: `Missing required field: ${field}`,
            error_details: { field, value: userRequest[field as keyof IFreshchatUserRequest] }
          };
        }
      }

      // Prepare Freshchat API payload
      const payload: IFreshchatAPIPayload = {
        email: userRequest.email,
        first_name: userRequest.first_name,
        last_name: userRequest.last_name,
        reference_id: userRequest.reference_id,
        properties: [
          {
            name: 'jeweler_id',
            value: userRequest.jeweler_id
          }
        ]
      };

      // Add phone if provided
      if (userRequest.phone) {
        payload.phone = userRequest.phone;
      }

      // Make API call to Freshchat
      const response = await fetch(`${this.baseURL}/users`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Freshchat API error:', data);
        return {
          success: false,
          message: 'Failed to create user in Freshchat',
          error_details: {
            status: response.status,
            statusText: response.statusText,
            data
          }
        };
      }

      // Store user ID in localStorage for future use
      if (typeof window !== 'undefined') {
        const userStorageKey = `freshchat_user_${userRequest.reference_id}`;
        const storageData = {
          freshchat_user_id: data.id,
          reference_id: userRequest.reference_id,
          jeweler_id: userRequest.jeweler_id,
          email: userRequest.email,
          created_at: new Date().toISOString(),
          user_data: data
        };
        
        localStorage.setItem(userStorageKey, JSON.stringify(storageData));
        localStorage.setItem('freshchat_last_created_user', data.id);
        
        console.log(`✅ Freshchat user stored in localStorage with key: ${userStorageKey}`);
      }

      return {
        success: true,
        freshchat_user_id: data.id,
        message: 'User created successfully in Freshchat',
        user_data: data
      };

    } catch (error) {
      console.error('Error creating Freshchat user:', error);
      return {
        success: false,
        message: 'Internal error while creating user',
        error_details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get user by reference_id
   */
  async getUserByReferenceId(referenceId: string): Promise<IFreshchatUserResponse> {
    try {
      if (!referenceId) {
        return {
          success: false,
          message: 'reference_id is required'
        };
      }

      const response = await fetch(
        `${this.baseURL}/users?reference_id=${encodeURIComponent(referenceId)}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      const data: IFreshchatUsersResponse = await response.json();

      if (!response.ok) {
        console.error('Freshchat API error:', data);
        return {
          success: false,
          message: 'Failed to retrieve user from Freshchat',
          error_details: {
            status: response.status,
            statusText: response.statusText,
            data
          }
        };
      }

      return {
        success: true,
        message: 'User retrieved successfully',
        user_data: data
      };

    } catch (error) {
      console.error('Error retrieving Freshchat user:', error);
      return {
        success: false,
        message: 'Internal error while retrieving user',
        error_details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<IFreshchatUserResponse> {
    try {
      if (!userId) {
        return {
          success: false,
          message: 'userId is required'
        };
      }

      const response = await fetch(`${this.baseURL}/users/${userId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Freshchat API error:', data);
        return {
          success: false,
          message: 'Failed to retrieve user from Freshchat',
          error_details: {
            status: response.status,
            statusText: response.statusText,
            data
          }
        };
      }

      return {
        success: true,
        message: 'User retrieved successfully',
        user_data: data
      };

    } catch (error) {
      console.error('Error retrieving Freshchat user:', error);
      return {
        success: false,
        message: 'Internal error while retrieving user',
        error_details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Update user properties
   */
  async updateUserProperties(userId: string, properties: IFreshchatProperty[]): Promise<IFreshchatUserResponse> {
    try {
      if (!userId) {
        return {
          success: false,
          message: 'userId is required'
        };
      }

      const response = await fetch(`${this.baseURL}/users/${userId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ properties })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Freshchat API error:', data);
        return {
          success: false,
          message: 'Failed to update user properties in Freshchat',
          error_details: {
            status: response.status,
            statusText: response.statusText,
            data
          }
        };
      }

      return {
        success: true,
        message: 'User properties updated successfully',
        user_data: data
      };

    } catch (error) {
      console.error('Error updating Freshchat user properties:', error);
      return {
        success: false,
        message: 'Internal error while updating user properties',
        error_details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Send message to a conversation
   */
  async sendMessage(
    conversationId: string, 
    messageRequest: IFreshchatSendMessageRequest,
    assumeIdentity: boolean = false
  ): Promise<IFreshchatSendMessageResponse> {
    try {
      // Validate required fields
      if (!conversationId) {
        return {
          success: false,
          message: 'conversationId is required'
        };
      }

      if (!messageRequest.message_parts || messageRequest.message_parts.length === 0) {
        return {
          success: false,
          message: 'message_parts is required and cannot be empty'
        };
      }

      if (!messageRequest.user_id || !messageRequest.actor_id) {
        return {
          success: false,
          message: 'user_id and actor_id are required'
        };
      }

      // Make API call to send message
      const response = await fetch(`${this.baseURL}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: this.getHeaders(assumeIdentity),
        body: JSON.stringify(messageRequest)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Freshchat send message API error:', data);
        return {
          success: false,
          message: 'Failed to send message to Freshchat conversation',
          error_details: {
            status: response.status,
            statusText: response.statusText,
            data
          }
        };
      }

      return {
        success: true,
        message_id: data.id || data.message_id,
        message: 'Message sent successfully to Freshchat conversation',
        message_data: data
      };

    } catch (error) {
      console.error('Error sending message to Freshchat:', error);
      return {
        success: false,
        message: 'Internal error while sending message',
        error_details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Send a simple text message to a conversation
   */
  async sendTextMessage(
    conversationId: string,
    content: string,
    userId: string,
    actorId: string,
    actorType: 'agent' | 'user' | 'system' = 'agent',
    assumeIdentity: boolean = false
  ): Promise<IFreshchatSendMessageResponse> {
    const messageRequest: IFreshchatSendMessageRequest = {
      message_parts: [
        {
          text: {
            content: content
          }
        }
      ],
      message_type: 'normal',
      actor_type: actorType,
      user_id: userId,
      actor_id: actorId
    };

    return this.sendMessage(conversationId, messageRequest, assumeIdentity);
  }

  /**
   * Send a message with quick reply buttons
   */
  async sendMessageWithQuickReplies(
    conversationId: string,
    content: string,
    quickReplies: string[],
    userId: string,
    actorId: string,
    actorType: 'agent' | 'user' | 'system' = 'agent',
    assumeIdentity: boolean = false
  ): Promise<IFreshchatSendMessageResponse> {
    const messageRequest: IFreshchatSendMessageRequest = {
      message_parts: [
        {
          text: {
            content: content
          }
        }
      ],
      reply_parts: [
        {
          collection: {
            sub_parts: quickReplies.map(label => ({
              quick_reply_button: {
                label: label
              }
            }))
          }
        }
      ],
      message_type: 'normal',
      actor_type: actorType,
      user_id: userId,
      actor_id: actorId
    };

    return this.sendMessage(conversationId, messageRequest, assumeIdentity);
  }

  /**
   * Send a message with URL buttons
   */
  async sendMessageWithUrlButtons(
    conversationId: string,
    content: string,
    urlButtons: Array<{ url: string; label: string; target?: '_blank' | '_self' }>,
    userId: string,
    actorId: string,
    actorType: 'agent' | 'user' | 'system' = 'agent',
    assumeIdentity: boolean = false
  ): Promise<IFreshchatSendMessageResponse> {
    const messageRequest: IFreshchatSendMessageRequest = {
      message_parts: [
        {
          text: {
            content: content
          }
        }
      ],
      reply_parts: [
        {
          collection: {
            sub_parts: urlButtons.map(button => ({
              url_button: {
                url: button.url,
                label: button.label,
                target: button.target || '_blank'
              }
            }))
          }
        }
      ],
      message_type: 'normal',
      actor_type: actorType,
      user_id: userId,
      actor_id: actorId
    };

    return this.sendMessage(conversationId, messageRequest, assumeIdentity);
  }

  /**
   * Send a message with mixed buttons (quick replies and URL buttons)
   */
  async sendMessageWithMixedButtons(
    conversationId: string,
    content: string,
    quickReplies: string[],
    urlButtons: Array<{ url: string; label: string; target?: '_blank' | '_self' }>,
    userId: string,
    actorId: string,
    actorType: 'agent' | 'user' | 'system' = 'agent',
    assumeIdentity: boolean = false
  ): Promise<IFreshchatSendMessageResponse> {
    const subParts: any[] = [
      // Add quick reply buttons
      ...quickReplies.map(label => ({
        quick_reply_button: {
          label: label
        }
      })),
      // Add URL buttons
      ...urlButtons.map(button => ({
        url_button: {
          url: button.url,
          label: button.label,
          target: button.target || '_blank'
        }
      }))
    ];

    const messageRequest: IFreshchatSendMessageRequest = {
      message_parts: [
        {
          text: {
            content: content
          }
        }
      ],
      reply_parts: [
        {
          collection: {
            sub_parts: subParts
          }
        }
      ],
      message_type: 'normal',
      actor_type: actorType,
      user_id: userId,
      actor_id: actorId
    };

    return this.sendMessage(conversationId, messageRequest, assumeIdentity);
  }

  /**
   * Get conversation details by ID
   */
  async getConversation(conversationId: string): Promise<IFreshchatGetConversationResponse> {
    try {
      if (!conversationId) {
        return {
          success: false,
          message: 'conversationId is required'
        };
      }

      // Make API call to get conversation
      const response = await fetch(`${this.baseURL}/conversations/${conversationId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Freshchat get conversation API error:', data);
        return {
          success: false,
          message: 'Failed to retrieve conversation from Freshchat',
          error_details: {
            status: response.status,
            statusText: response.statusText,
            data
          }
        };
      }

      return {
        success: true,
        message: 'Conversation retrieved successfully',
        conversation_data: data
      };

    } catch (error) {
      console.error('Error retrieving Freshchat conversation:', error);
      return {
        success: false,
        message: 'Internal error while retrieving conversation',
        error_details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Default instance
export const freshchatAPI = new FreshchatAPI();

// Individual functions for easier imports
export const createFreshchatUser = (userRequest: IFreshchatUserRequest) => 
  freshchatAPI.createUser(userRequest);

export const getFreshchatUserByReferenceId = (referenceId: string) => 
  freshchatAPI.getUserByReferenceId(referenceId);

export const getFreshchatUserById = (userId: string) => 
  freshchatAPI.getUserById(userId);

export const updateFreshchatUserProperties = (userId: string, properties: IFreshchatProperty[]) => 
  freshchatAPI.updateUserProperties(userId, properties);

// Message functions
export const sendFreshchatMessage = (
  conversationId: string, 
  messageRequest: IFreshchatSendMessageRequest,
  assumeIdentity?: boolean
) => freshchatAPI.sendMessage(conversationId, messageRequest, assumeIdentity);

export const sendFreshchatTextMessage = (
  conversationId: string,
  content: string,  
  userId: string,
  actorId: string,
  actorType?: 'agent' | 'user' | 'system',
  assumeIdentity?: boolean
) => freshchatAPI.sendTextMessage(conversationId, content, userId, actorId, actorType, assumeIdentity);

export const sendFreshchatMessageWithQuickReplies = (
  conversationId: string,
  content: string,
  quickReplies: string[],
  userId: string,
  actorId: string,
  actorType?: 'agent' | 'user' | 'system',
  assumeIdentity?: boolean
) => freshchatAPI.sendMessageWithQuickReplies(conversationId, content, quickReplies, userId, actorId, actorType, assumeIdentity);

export const sendFreshchatMessageWithUrlButtons = (
  conversationId: string,
  content: string,
  urlButtons: Array<{ url: string; label: string; target?: '_blank' | '_self' }>,
  userId: string,
  actorId: string,
  actorType?: 'agent' | 'user' | 'system',
  assumeIdentity?: boolean
) => freshchatAPI.sendMessageWithUrlButtons(conversationId, content, urlButtons, userId, actorId, actorType, assumeIdentity);

export const sendFreshchatMessageWithMixedButtons = (
  conversationId: string,
  content: string,
  quickReplies: string[],
  urlButtons: Array<{ url: string; label: string; target?: '_blank' | '_self' }>,
  userId: string,
  actorId: string,
  actorType?: 'agent' | 'user' | 'system',
  assumeIdentity?: boolean
) => freshchatAPI.sendMessageWithMixedButtons(conversationId, content, quickReplies, urlButtons, userId, actorId, actorType, assumeIdentity);

// Conversation functions
export const getFreshchatConversation = (conversationId: string) => 
  freshchatAPI.getConversation(conversationId);

/**
 * LocalStorage Management Functions
 */

/**
 * Get stored Freshchat user data by reference ID
 */
export const getStoredFreshchatUser = (referenceId: string) => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStorageKey = `freshchat_user_${referenceId}`;
    const storedData = localStorage.getItem(userStorageKey);
    
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving stored Freshchat user:', error);
    return null;
  }
};

/**
 * Get the last created Freshchat user ID
 */
export const getLastCreatedFreshchatUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem('freshchat_last_created_user');
  } catch (error) {
    console.error('Error retrieving last created user ID:', error);
    return null;
  }
};

/**
 * Get all stored Freshchat users
 */
export const getAllStoredFreshchatUsers = () => {
  if (typeof window === 'undefined') return [];
  
  try {
    const users = [];
    const keys = Object.keys(localStorage);
    
    for (const key of keys) {
      if (key.startsWith('freshchat_user_')) {
        const userData = localStorage.getItem(key);
        if (userData) {
          users.push(JSON.parse(userData));
        }
      }
    }
    
    return users;
  } catch (error) {
    console.error('Error retrieving all stored users:', error);
    return [];
  }
};

/**
 * Remove stored Freshchat user data
 */
export const removeStoredFreshchatUser = (referenceId: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const userStorageKey = `freshchat_user_${referenceId}`;
    localStorage.removeItem(userStorageKey);
    
    console.log(`🗑️ Removed stored Freshchat user: ${referenceId}`);
    return true;
  } catch (error) {
    console.error('Error removing stored user:', error);
    return false;
  }
};

/**
 * Clear all stored Freshchat user data
 */
export const clearAllStoredFreshchatUsers = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const keys = Object.keys(localStorage);
    let removedCount = 0;
    
    for (const key of keys) {
      if (key.startsWith('freshchat_user_') || key === 'freshchat_last_created_user') {
        localStorage.removeItem(key);
        removedCount++;
      }
    }
    
    console.log(`🗑️ Cleared ${removedCount} stored Freshchat users`);
    return true;
  } catch (error) {
    console.error('Error clearing stored users:', error);
    return false;
  }
};

/**
 * Check if user exists in localStorage
 */
export const isUserStoredLocally = (referenceId: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userStorageKey = `freshchat_user_${referenceId}`;
  return localStorage.getItem(userStorageKey) !== null;
};
/**
 * Internal User API Integration
 * Handles user creation through the internal API instead of direct Freshchat API
 * Uses host_auth_token for authentication
 */

import {
  IInternalUserRequest,
  IInternalUserResponse
} from './types';

/**
 * Internal User API Client Class
 */
export class InternalUserAPI {
  private baseURL: string;

  constructor(baseURL: string = '') {
    // Base URL will be determined dynamically or from environment
    this.baseURL = baseURL;
  }

  /**
   * Get headers for internal API requests with host_auth_token
   */
  private getHeaders(hostAuthToken: string): HeadersInit {
    return {
      'accept': 'application/json',
      'Authorization': `Bearer ${hostAuthToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Create a new user through the internal API
   */
  async createUser(
    userRequest: IInternalUserRequest, 
    hostAuthToken: string,
    apiBaseURL?: string
  ): Promise<IInternalUserResponse> {
    try {
      // Use provided API base URL or construct from current location
      const baseUrl = apiBaseURL || this.getApiBaseURL();
      
      // Validate required fields
      const requiredFields = ['user_email', 'org_id', 'user_name', 'first_name', 'last_name', 'phone', 'reference_id'];
      for (const field of requiredFields) {
        if (!userRequest[field as keyof IInternalUserRequest]) {
          return {
            success: false,
            message: `Missing required field: ${field}`,
            error_details: { field, value: userRequest[field as keyof IInternalUserRequest] }
          };
        }
      }

      if (!hostAuthToken) {
        return {
          success: false,
          message: 'host_auth_token is required for authentication',
          error_details: { missing_token: true }
        };
      }

      // Make API call to internal user creation endpoint
      const response = await fetch(`${baseUrl}/api/v1/user/create`, {
        method: 'POST',
        headers: this.getHeaders(hostAuthToken),
        body: JSON.stringify(userRequest)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Internal User API error:', data);
        return {
          success: false,
          message: 'Failed to create user through internal API',
          error_details: {
            status: response.status,
            statusText: response.statusText,
            data
          }
        };
      }

      // Extract both user_id and freshchat_user_id from response
      const userId = data.id || data.user_id;
      const freshchatUserId = data.freshchat_user_id;

      // Store user data in localStorage for future use
      if (typeof window !== 'undefined') {
        const userStorageKey = `internal_user_${userRequest.reference_id}`;
        const storageData = {
          user_id: userId,
          freshchat_user_id: freshchatUserId,
          reference_id: userRequest.reference_id,
          org_id: userRequest.org_id,
          user_email: userRequest.user_email,
          created_at: new Date().toISOString(),
          user_data: data
        };
        
        localStorage.setItem(userStorageKey, JSON.stringify(storageData));
        localStorage.setItem('internal_last_created_user', userId);
        
        // Also store the freshchat_user_id separately if available
        if (freshchatUserId) {
          localStorage.setItem('internal_last_created_freshchat_user', freshchatUserId);
          
          // Store mapping between user_id and freshchat_user_id
          const mappingKey = `user_freshchat_mapping_${userId}`;
          localStorage.setItem(mappingKey, freshchatUserId);
        }
        
        console.log(`✅ Internal user stored in localStorage with key: ${userStorageKey}`);
        console.log(`   - user_id: ${userId}`);
        console.log(`   - freshchat_user_id: ${freshchatUserId || 'Not provided'}`);
      }

      return {
        success: true,
        user_id: userId,
        freshchat_user_id: freshchatUserId,
        message: 'User created successfully through internal API',
        user_data: data
      };

    } catch (error) {
      console.error('Error creating internal user:', error);
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
   * Get API base URL for services API (different from local origin)
   */
  private getApiBaseURL(): string {
    // Services API is running on a different server
    return process.env.NEXT_PUBLIC_SERVICES_API_URL || 'http://192.168.50.19:8000';
  }

  /**
   * Create user with automatic org_id and user_name generation
   */
  async createUserSimplified(
    email: string,
    firstName: string,
    lastName: string,
    phone: string,
    referenceId: string,
    orgId: string,
    hostAuthToken: string,
    apiBaseURL?: string
  ): Promise<IInternalUserResponse> {
    const userRequest: IInternalUserRequest = {
      user_email: email,
      org_id: orgId,
      user_name: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`, // Auto-generate username
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      reference_id: referenceId
    };

    return this.createUser(userRequest, hostAuthToken, apiBaseURL);
  }

  /**
   * Convert legacy Freshchat request to internal API format
   */
  convertFromFreshchatRequest(
    freshchatRequest: { 
      email: string; 
      first_name: string; 
      last_name: string; 
      phone?: string; 
      reference_id: string; 
      jeweler_id: string; 
    }
  ): IInternalUserRequest {
    return {
      user_email: freshchatRequest.email,
      org_id: freshchatRequest.jeweler_id, // Use jeweler_id as org_id
      user_name: `${freshchatRequest.first_name.toLowerCase()}.${freshchatRequest.last_name.toLowerCase()}`,
      first_name: freshchatRequest.first_name,
      last_name: freshchatRequest.last_name,
      phone: freshchatRequest.phone || '',
      reference_id: freshchatRequest.reference_id
    };
  }
}

// Default instance
export const internalUserAPI = new InternalUserAPI();

// Individual functions for easier imports
export const createInternalUser = (
  userRequest: IInternalUserRequest, 
  hostAuthToken: string,
  apiBaseURL?: string
) => internalUserAPI.createUser(userRequest, hostAuthToken, apiBaseURL);

export const createInternalUserSimplified = (
  email: string,
  firstName: string,
  lastName: string,
  phone: string,
  referenceId: string,
  orgId: string,
  hostAuthToken: string,
  apiBaseURL?: string
) => internalUserAPI.createUserSimplified(email, firstName, lastName, phone, referenceId, orgId, hostAuthToken, apiBaseURL);

/**
 * LocalStorage Management Functions for Internal Users
 */

/**
 * Get stored internal user data by reference ID
 */
export const getStoredInternalUser = (referenceId: string) => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStorageKey = `internal_user_${referenceId}`;
    const storedData = localStorage.getItem(userStorageKey);
    
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving stored internal user:', error);
    return null;
  }
};

/**
 * Get the last created internal user ID
 */
export const getLastCreatedInternalUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem('internal_last_created_user');
  } catch (error) {
    console.error('Error retrieving last created internal user ID:', error);
    return null;
  }
};

/**
 * Get the last created Freshchat user ID (from internal API response)
 */
export const getLastCreatedInternalFreshchatUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem('internal_last_created_freshchat_user');
  } catch (error) {
    console.error('Error retrieving last created Freshchat user ID:', error);
    return null;
  }
};

/**
 * Get Freshchat user ID by internal user ID
 */
export const getFreshchatUserIdByUserId = (userId: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const mappingKey = `user_freshchat_mapping_${userId}`;
    return localStorage.getItem(mappingKey);
  } catch (error) {
    console.error('Error retrieving Freshchat user ID mapping:', error);
    return null;
  }
};

/**
 * Get both user IDs for a reference ID
 */
export const getUserIdsByReferenceId = (referenceId: string): { user_id: string | null, freshchat_user_id: string | null } => {
  const userData = getStoredInternalUser(referenceId);
  
  if (userData) {
    return {
      user_id: userData.user_id || null,
      freshchat_user_id: userData.freshchat_user_id || null
    };
  }
  
  return {
    user_id: null,
    freshchat_user_id: null
  };
};

/**
 * Get all stored internal users
 */
export const getAllStoredInternalUsers = () => {
  if (typeof window === 'undefined') return [];
  
  try {
    const users = [];
    const keys = Object.keys(localStorage);
    
    for (const key of keys) {
      if (key.startsWith('internal_user_')) {
        const userData = localStorage.getItem(key);
        if (userData) {
          users.push(JSON.parse(userData));
        }
      }
    }
    
    return users;
  } catch (error) {
    console.error('Error retrieving all stored internal users:', error);
    return [];
  }
};

/**
 * Check if internal user exists in localStorage
 */
export const isInternalUserStoredLocally = (referenceId: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userStorageKey = `internal_user_${referenceId}`;
  return localStorage.getItem(userStorageKey) !== null;
};

/**
 * Get host auth token from localStorage or other storage
 */
export const getHostAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Try different possible storage keys for host auth token
    return localStorage.getItem('host_auth_token') || 
           localStorage.getItem('hostAuthToken') ||
           sessionStorage.getItem('host_auth_token') ||
           sessionStorage.getItem('hostAuthToken') ||
           null;
  } catch (error) {
    console.error('Error retrieving host auth token:', error);
    return null;
  }
};
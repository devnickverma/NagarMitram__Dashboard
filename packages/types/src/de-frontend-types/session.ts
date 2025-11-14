/**
 * Session API Integration
 * Handles session creation through the internal API
 * Replaces existing session management with new API endpoint
 */

import {
  ICreateSessionRequest,
  ICreateSessionResponse
} from './types';

/**
 * Session API Client Class
 */
export class SessionAPI {
  private baseURL: string;

  constructor(baseURL: string = '') {
    // Base URL will be determined dynamically or from environment
    this.baseURL = baseURL;
  }

  /**
   * Get headers for session API requests with host_auth_token
   */
  private getHeaders(hostAuthToken?: string): HeadersInit {
    const headers: HeadersInit = {
      'accept': 'application/json',
      'Content-Type': 'application/json'
    };
    
    // Use provided token or fallback to hardcoded token
    const token = hostAuthToken || 'hardcoded_dev_token_12345_abcdef';
    headers['Authorization'] = `Bearer ${token}`;
    
    return headers;
  }

  /**
   * Create a new session through the internal API
   */
  async createSession(
    sessionRequest: ICreateSessionRequest,
    hostAuthToken?: string,
    apiBaseURL?: string
  ): Promise<ICreateSessionResponse> {
    try {
      // Use provided API base URL or construct from current location
      const baseUrl = apiBaseURL || this.getApiBaseURL();
      
      // Validate required fields
      if (!sessionRequest.user_id) {
        return {
          success: false,
          message: 'Missing required field: user_id'
        };
      }

      if (!sessionRequest.auth_token) {
        return {
          success: false,
          message: 'Missing required field: auth_token'
        };
      }

      // hostAuthToken is now optional - will use hardcoded fallback if not provided
      if (!hostAuthToken) {
        console.warn('⚠️ No host_auth_token provided - using hardcoded fallback for development');
      }

      // Debug logging
      console.log('📤 Session API Request:', {
        url: `${baseUrl}/api/v1/session/create`,
        headers: this.getHeaders(hostAuthToken),
        body: sessionRequest
      });

      // Make API call to session creation endpoint
      const response = await fetch(`${baseUrl}/api/v1/session/create`, {
        method: 'POST',
        headers: this.getHeaders(hostAuthToken),
        body: JSON.stringify(sessionRequest)
      });

      const data = await response.json();

      // Debug logging
      console.log('📥 Session API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        data: data
      });

      if (!response.ok) {
        console.error('❌ Session API error:', data);
        return {
          success: false,
          message: 'Failed to create session through internal API',
          error_details: {
            status: response.status,
            statusText: response.statusText,
            data
          }
        };
      }

      // Store session data in localStorage for future use
      if (typeof window !== 'undefined') {
        const sessionStorageKey = `session_${sessionRequest.user_id}`;
        const sessionData = {
          session_id: data.id || data.session_id,
          user_id: sessionRequest.user_id,
          auth_token: sessionRequest.auth_token,
          metadata: sessionRequest.metadata,
          created_at: new Date().toISOString(),
          session_data: data
        };
        
        localStorage.setItem(sessionStorageKey, JSON.stringify(sessionData));
        localStorage.setItem('last_created_session', data.id || data.session_id);
        localStorage.setItem('current_active_session', data.id || data.session_id);
        
        // Store session mapping for easy lookup
        const sessionMappingKey = `session_mapping_${data.id || data.session_id}`;
        localStorage.setItem(sessionMappingKey, sessionRequest.user_id);
        
        console.log(`✅ Session stored in localStorage with key: ${sessionStorageKey}`);
        console.log(`   - session_id: ${data.id || data.session_id}`);
        console.log(`   - user_id: ${sessionRequest.user_id}`);
      }

      return {
        success: true,
        session_id: data.id || data.session_id,
        message: 'Session created successfully through internal API',
        session_data: data
      };

    } catch (error) {
      console.error('Error creating session:', error);
      return {
        success: false,
        message: 'Internal error while creating session',
        error_details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Create session with simplified parameters
   */
  async createSessionSimplified(
    userId: string,
    authToken: string,
    hostAuthToken: string,
    metadata?: { [key: string]: any },
    apiBaseURL?: string
  ): Promise<ICreateSessionResponse> {
    const sessionRequest: ICreateSessionRequest = {
      user_id: userId,
      auth_token: authToken,
      metadata: metadata || {}
    };

    return this.createSession(sessionRequest, hostAuthToken, apiBaseURL);
  }

  /**
   * Get API base URL for services API (different from local origin)
   */
  private getApiBaseURL(): string {
    // Services API is running on a different server
    return process.env.NEXT_PUBLIC_SERVICES_API_URL || 'http://192.168.50.19:8000';
  }
}

// Default instance
export const sessionAPI = new SessionAPI();

// Individual functions for easier imports
export const createSession = (
  sessionRequest: ICreateSessionRequest,
  hostAuthToken?: string,
  apiBaseURL?: string
) => sessionAPI.createSession(sessionRequest, hostAuthToken, apiBaseURL);

export const createSessionSimplified = (
  userId: string,
  authToken: string,
  hostAuthToken: string,
  metadata?: { [key: string]: any },
  apiBaseURL?: string
) => sessionAPI.createSessionSimplified(userId, authToken, hostAuthToken, metadata, apiBaseURL);

/**
 * LocalStorage Management Functions for Sessions
 */

/**
 * Get stored session data by user ID
 */
export const getStoredSession = (userId: string) => {
  if (typeof window === 'undefined') return null;
  
  try {
    const sessionStorageKey = `session_${userId}`;
    const storedData = localStorage.getItem(sessionStorageKey);
    
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving stored session:', error);
    return null;
  }
};

/**
 * Get the last created session ID
 */
export const getLastCreatedSessionId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem('last_created_session');
  } catch (error) {
    console.error('Error retrieving last created session ID:', error);
    return null;
  }
};

/**
 * Get the current active session ID
 */
export const getCurrentActiveSessionId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem('current_active_session');
  } catch (error) {
    console.error('Error retrieving current active session ID:', error);
    return null;
  }
};

/**
 * Get user ID by session ID
 */
export const getUserIdBySessionId = (sessionId: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const sessionMappingKey = `session_mapping_${sessionId}`;
    return localStorage.getItem(sessionMappingKey);
  } catch (error) {
    console.error('Error retrieving user ID by session ID:', error);
    return null;
  }
};

/**
 * Get all stored sessions
 */
export const getAllStoredSessions = () => {
  if (typeof window === 'undefined') return [];
  
  try {
    const sessions = [];
    const keys = Object.keys(localStorage);
    
    for (const key of keys) {
      if (key.startsWith('session_') && !key.includes('mapping')) {
        const sessionData = localStorage.getItem(key);
        if (sessionData) {
          sessions.push(JSON.parse(sessionData));
        }
      }
    }
    
    return sessions;
  } catch (error) {
    console.error('Error retrieving all stored sessions:', error);
    return [];
  }
};

/**
 * Check if session exists in localStorage
 */
export const isSessionStoredLocally = (userId: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  const sessionStorageKey = `session_${userId}`;
  return localStorage.getItem(sessionStorageKey) !== null;
};

/**
 * Remove stored session data
 */
export const removeStoredSession = (userId: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const sessionStorageKey = `session_${userId}`;
    const sessionData = getStoredSession(userId);
    
    // Remove main session data
    localStorage.removeItem(sessionStorageKey);
    
    // Remove session mapping if exists
    if (sessionData?.session_id) {
      const sessionMappingKey = `session_mapping_${sessionData.session_id}`;
      localStorage.removeItem(sessionMappingKey);
    }
    
    console.log(`🗑️ Removed stored session for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('Error removing stored session:', error);
    return false;
  }
};

/**
 * Clear all stored session data
 */
export const clearAllStoredSessions = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const keys = Object.keys(localStorage);
    let removedCount = 0;
    
    for (const key of keys) {
      if (key.startsWith('session_') || 
          key === 'last_created_session' || 
          key === 'current_active_session') {
        localStorage.removeItem(key);
        removedCount++;
      }
    }
    
    console.log(`🗑️ Cleared ${removedCount} stored sessions`);
    return true;
  } catch (error) {
    console.error('Error clearing stored sessions:', error);
    return false;
  }
};

/**
 * Set current active session
 */
export const setCurrentActiveSession = (sessionId: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem('current_active_session', sessionId);
    console.log(`✅ Set current active session: ${sessionId}`);
    return true;
  } catch (error) {
    console.error('Error setting current active session:', error);
    return false;
  }
};
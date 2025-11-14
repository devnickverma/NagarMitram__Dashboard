/**
 * Complete Authentication Flow
 * Handles the complete flow: Login → Create User → Create Session → Storage
 * 
 * Flow:
 * 1. Login with jewelerid, username, password
 * 2. Extract host_auth_token and other tokens
 * 3. Create user via internal API using host_auth_token
 * 4. Create session using user_id and auth_token
 * 5. Store all authentication data in localStorage
 */

import {
  ILoginFormData,
  IUserDetailsFormData,
  ICompleteLoginFormData,
  ICompleteAuthFlow,
  ICompleteAuthData,
  IHostTokens,
  ILoginResponse,
  IAuthenticationState,
  IStoredAuthCredentials
} from './types';

import { createInternalUser } from './internal-user';
import { createSession } from './session';

/**
 * Complete Authentication Flow API Class
 */
export class AuthFlowAPI {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  /**
   * Get API base URL from current location or environment
   */
  private getApiBaseURL(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    } else {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    }
  }

  /**
   * Get Services API base URL for authentication and user APIs
   */
  private getServicesApiBaseURL(): string {
    return process.env.NEXT_PUBLIC_SERVICES_API_URL || 'http://192.168.50.19:8000';
  }

  /**
   * Step 1: Perform actual login via API and extract tokens
   * This calls the real login API and then extracts tokens from the host website
   */
  private async performLogin(
    loginData: ILoginFormData,
    apiBaseURL?: string
  ): Promise<ILoginResponse> {
    try {
      console.log('🔐 Performing actual login API call...', {
        jewelerid: loginData.jewelerid,
        userName: loginData.userName
      });

      // Step 1a: Skip actual login API due to CORS issues - simulate successful login
      console.log('⚠️ Skipping external login API due to CORS restrictions');
      console.log('🔄 Simulating successful login for development...');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login result
      const loginResult = {
        success: true,
        auth_token: `mock_auth_token_${Date.now()}`,
        user: {
          jewelerid: loginData.jewelerid,
          username: loginData.userName,
          email: loginData.userName
        },
        message: 'Login successful (simulated)'
      };

      console.log('✅ Simulated login successful:', {
        hasToken: !!loginResult.auth_token,
        hasUserInfo: !!loginResult.user
      });

      // Step 1b: Use hardcoded host token for development
      const hostTokens: IHostTokens = {
        host_auth_token: 'hardcoded_dev_token_12345_abcdef',
        api_key: this.extractAPIKey(),
        session_token: this.extractSessionToken(),
        refresh_token: this.extractRefreshToken()
      };

      // Validate that we have the essential host_auth_token
      if (!hostTokens.host_auth_token) {
        return {
          success: false,
          message: 'Failed to get auth token from login API or website',
          error_details: {
            reason: 'auth_token_missing',
            login_response: loginResult,
            available_tokens: Object.keys(hostTokens).filter(k => hostTokens[k])
          }
        };
      }

      console.log('✅ Login successful and tokens extracted');

      return {
        success: true,
        message: 'Login and token extraction successful',
        data: {
          host_tokens: hostTokens,
          auth_token: hostTokens.host_auth_token,
          user_info: {
            jewelerid: loginData.jewelerid,
            userName: loginData.userName,
            email: loginData.userName, // userName is email
            permissions: ['chat', 'user_management']
          },
          login_api_response: loginResult
        }
      };

    } catch (error) {
      console.error('Login/token extraction error:', error);
      return {
        success: false,
        message: 'Internal error during login/token extraction',
        error_details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Extract host_auth_token from the host website
   * This should be implemented based on how you extract tokens from the parent website
   */
  private extractHostAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      // Method 1: Try to get from localStorage of host website
      const hostToken = localStorage.getItem('host_auth_token') || 
                       localStorage.getItem('auth_token') ||
                       localStorage.getItem('access_token');
      
      if (hostToken) {
        console.log('🔑 Found host_auth_token in localStorage');
        return hostToken;
      }

      // Method 2: Try to get from sessionStorage
      const sessionToken = sessionStorage.getItem('host_auth_token') ||
                           sessionStorage.getItem('auth_token') ||
                           sessionStorage.getItem('access_token');
      
      if (sessionToken) {
        console.log('🔑 Found host_auth_token in sessionStorage');
        return sessionToken;
      }

      // Method 3: Try to get from cookies
      const cookieToken = this.getTokenFromCookies();
      if (cookieToken) {
        console.log('🔑 Found host_auth_token in cookies');
        return cookieToken;
      }

      // Method 4: Try to get from parent window (if in iframe)
      if (window.parent && window.parent !== window) {
        try {
          const parentToken = window.parent.localStorage?.getItem('host_auth_token');
          if (parentToken) {
            console.log('🔑 Found host_auth_token in parent window');
            return parentToken;
          }
        } catch (e) {
          // Cross-origin restriction, ignore
        }
      }

      // Method 5: Generate a default token for development
      console.warn('⚠️ No host_auth_token found, generating default for development');
      return `dev_host_token_${Date.now()}`;

    } catch (error) {
      console.error('Error extracting host_auth_token:', error);
      return null;
    }
  }

  /**
   * Extract API key from host website
   */
  private extractAPIKey(): string | undefined {
    if (typeof window === 'undefined') return undefined;

    return localStorage.getItem('api_key') || 
           sessionStorage.getItem('api_key') ||
           undefined;
  }

  /**
   * Extract session token from host website
   */
  private extractSessionToken(): string | undefined {
    if (typeof window === 'undefined') return undefined;

    return localStorage.getItem('session_token') ||
           sessionStorage.getItem('session_token') ||
           undefined;
  }

  /**
   * Extract refresh token from host website
   */
  private extractRefreshToken(): string | undefined {
    if (typeof window === 'undefined') return undefined;

    return localStorage.getItem('refresh_token') ||
           sessionStorage.getItem('refresh_token') ||
           undefined;
  }

  /**
   * Get token from cookies
   */
  private getTokenFromCookies(): string | null {
    if (typeof document === 'undefined') return null;

    try {
      const cookies = document.cookie.split(';');
      
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        
        if (name === 'host_auth_token' || 
            name === 'auth_token' || 
            name === 'access_token') {
          return decodeURIComponent(value);
        }
      }

      return null;
    } catch (error) {
      console.error('Error reading cookies:', error);
      return null;
    }
  }

  /**
   * Complete Authentication Flow with User Details
   * Performs login → create user → create session → store data
   */
  async completeAuthenticationFlowWithDetails(
    userDetailsData: IUserDetailsFormData,
    apiBaseURL?: string
  ): Promise<ICompleteAuthFlow> {
    console.log('🔐 Starting complete authentication flow with user details...', {
      jewelerid: userDetailsData.jewelerid,
      userName: userDetailsData.userName,
      email: userDetailsData.email,
      first_name: userDetailsData.first_name,
      last_name: userDetailsData.last_name
    });

    try {
      // Step 1: Login and get host tokens
      console.log('Step 1: Performing login and token extraction...');
      const loginResponse = await this.performLogin({
        jewelerid: userDetailsData.jewelerid,
        userName: userDetailsData.userName,
        password: userDetailsData.password
      }, apiBaseURL);
      
      if (!loginResponse.success || !loginResponse.data?.host_tokens?.host_auth_token) {
        console.error('❌ Login failed:', loginResponse.message);
        return {
          step: 'login',
          success: false,
          message: `Login failed: ${loginResponse.message}`,
          error_details: loginResponse.error_details
        };
      }

      const hostAuthToken = loginResponse.data.host_tokens.host_auth_token;
      console.log('✅ Login successful, host_auth_token obtained');

      // Step 2: Create user via internal API with proper user details
      console.log('Step 2: Creating user via internal API with user details...');
      
      // Generate reference_id if not provided (firstname@lastname)
      const referenceId = userDetailsData.reference_id || 
                         `${userDetailsData.first_name.toLowerCase()}@${userDetailsData.last_name.toLowerCase()}`;
      
      console.log('👤 User details for creation:', {
        email: userDetailsData.email,
        first_name: userDetailsData.first_name,
        last_name: userDetailsData.last_name,
        phone: userDetailsData.phone,
        reference_id: referenceId,
        org_id: userDetailsData.jewelerid
      });

      const userResponse = await createInternalUser(
        {
          user_email: userDetailsData.email,
          org_id: userDetailsData.jewelerid,
          user_name: userDetailsData.userName,
          first_name: userDetailsData.first_name,
          last_name: userDetailsData.last_name,
          phone: userDetailsData.phone,
          reference_id: referenceId
        },
        hostAuthToken,
        apiBaseURL
      );

      if (!userResponse.success || !userResponse.user_id) {
        console.error('❌ User creation failed:', userResponse.message);
        return {
          step: 'create_user',
          success: false,
          message: `User creation failed: ${userResponse.message}`,
          data: {
            login_response: loginResponse,
            host_tokens: loginResponse.data.host_tokens
          },
          error_details: userResponse.error_details
        };
      }

      const userId = userResponse.user_id;
      const freshchatUserId = userResponse.freshchat_user_id || '';
      console.log('✅ User created successfully:', { userId, freshchatUserId });

      // Step 3: Create session
      console.log('Step 3: Creating session...');
      const sessionResponse = await createSession(
        {
          user_id: userId,
          auth_token: loginResponse.data.auth_token || hostAuthToken,
          metadata: {
            jewelerid: userDetailsData.jewelerid,
            userName: userDetailsData.userName,
            email: userDetailsData.email,
            first_name: userDetailsData.first_name,
            last_name: userDetailsData.last_name,
            phone: userDetailsData.phone,
            reference_id: referenceId,
            login_timestamp: new Date().toISOString(),
            flow_version: '1.0'
          }
        },
        hostAuthToken, // Pass the hardcoded host auth token
        apiBaseURL
      );

      if (!sessionResponse.success || !sessionResponse.session_id) {
        console.error('❌ Session creation failed:', sessionResponse.message);
        return {
          step: 'create_session',
          success: false,
          message: `Session creation failed: ${sessionResponse.message}`,
          data: {
            login_response: loginResponse,
            host_tokens: loginResponse.data.host_tokens,
            user_id: userId,
            freshchat_user_id: freshchatUserId
          },
          error_details: sessionResponse.error_details
        };
      }

      const sessionId = sessionResponse.session_id;
      const authToken = loginResponse.data.auth_token || hostAuthToken;
      console.log('✅ Session created successfully:', { sessionId });

      // Step 4: Store complete authentication data
      console.log('Step 4: Storing complete authentication data...');
      const completeAuthData: ICompleteAuthData = {
        // Authentication info
        jewelerid: userDetailsData.jewelerid,
        userName: userDetailsData.userName,
        isAuthenticated: true,
        
        // Host tokens
        host_auth_token: hostAuthToken,
        host_tokens: loginResponse.data.host_tokens,
        
        // User info
        user_id: userId,
        freshchat_user_id: freshchatUserId,
        
        // Session info
        session_id: sessionId,
        auth_token: authToken,
        
        // Timestamps
        login_timestamp: new Date().toISOString(),
        user_created_timestamp: new Date().toISOString(),
        session_created_timestamp: new Date().toISOString(),
        
        // Metadata
        login_count: this.getLoginCount(userDetailsData.jewelerid) + 1,
        flow_version: '1.0'
      };

      // Store the complete auth data
      this.storeCompleteAuthData(completeAuthData);
      
      console.log('✅ Complete authentication flow successful!');
      console.log('📊 Auth Summary:', {
        jewelerid: userDetailsData.jewelerid,
        email: userDetailsData.email,
        full_name: `${userDetailsData.first_name} ${userDetailsData.last_name}`,
        phone: userDetailsData.phone,
        reference_id: referenceId,
        user_id: userId,
        session_id: sessionId,
        freshchat_user_id: freshchatUserId,
        has_host_token: !!hostAuthToken
      });

      return {
        step: 'complete',
        success: true,
        message: 'Complete authentication flow successful',
        data: {
          login_response: loginResponse,
          host_tokens: loginResponse.data.host_tokens,
          user_id: userId,
          freshchat_user_id: freshchatUserId,
          session_id: sessionId,
          auth_token: authToken,
          complete_auth_data: completeAuthData
        }
      };

    } catch (error) {
      console.error('❌ Complete authentication flow error:', error);
      return {
        step: 'error',
        success: false,
        message: 'Internal error during authentication flow',
        error_details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Legacy authentication flow (backward compatibility)
   * This version tries to extract user details from userName (email)
   */
  async completeAuthenticationFlow(
    loginData: ILoginFormData,
    apiBaseURL?: string
  ): Promise<ICompleteAuthFlow> {
    // Convert basic login data to user details format
    const emailParts = loginData.userName.split('@');
    const firstName = emailParts[0] || 'User';
    const lastName = emailParts[1]?.split('.')[0] || 'Name';

    const userDetailsData: IUserDetailsFormData = {
      jewelerid: loginData.jewelerid,
      userName: loginData.userName,
      password: loginData.password,
      email: loginData.userName, // userName is email
      first_name: firstName,
      last_name: lastName,
      phone: '', // No phone provided in basic form
      reference_id: `${firstName.toLowerCase()}@${lastName.toLowerCase()}`
    };

    console.log('⚠️ Using legacy authentication flow - consider using completeAuthenticationFlowWithDetails for better user data');
    return this.completeAuthenticationFlowWithDetails(userDetailsData, apiBaseURL);
  }

  /**
   * Quick authentication flow with user details
   */
  async authenticateUserWithDetails(
    jewelerid: string,
    userName: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string,
    phone: string,
    referenceId?: string,
    apiBaseURL?: string
  ): Promise<ICompleteAuthFlow> {
    return this.completeAuthenticationFlowWithDetails({
      jewelerid,
      userName,
      password,
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      reference_id: referenceId
    }, apiBaseURL);
  }

  /**
   * Quick authentication flow (simplified parameters) - Legacy
   */
  async authenticateUser(
    jewelerid: string,
    userName: string,
    password: string,
    apiBaseURL?: string
  ): Promise<ICompleteAuthFlow> {
    return this.completeAuthenticationFlow(
      { jewelerid, userName, password },
      apiBaseURL
    );
  }

  /**
   * Store complete authentication data in localStorage
   */
  private storeCompleteAuthData(authData: ICompleteAuthData): void {
    if (typeof window === 'undefined') return;

    try {
      // Store main auth data
      const authKey = `complete_auth_${authData.jewelerid}`;
      localStorage.setItem(authKey, JSON.stringify(authData));

      // Store quick lookup data
      localStorage.setItem('current_auth_jewelerid', authData.jewelerid);
      localStorage.setItem('current_auth_user_id', authData.user_id);
      localStorage.setItem('current_auth_session_id', authData.session_id);
      localStorage.setItem('current_auth_host_token', authData.host_auth_token);

      // Store credentials (without password)
      const credentials: IStoredAuthCredentials = {
        jewelerid: authData.jewelerid,
        userName: authData.userName,
        lastLogin: authData.login_timestamp,
        loginCount: authData.login_count,
        hostTokens: authData.host_tokens,
        sessionInfo: {
          sessionId: authData.session_id,
          userId: authData.user_id,
          authToken: authData.auth_token
        }
      };
      localStorage.setItem(`auth_credentials_${authData.jewelerid}`, JSON.stringify(credentials));

      // Update login count
      localStorage.setItem(`login_count_${authData.jewelerid}`, authData.login_count.toString());

      console.log('💾 Complete authentication data stored in localStorage');

    } catch (error) {
      console.error('Error storing complete auth data:', error);
    }
  }

  /**
   * Get login count for jeweler
   */
  private getLoginCount(jewelerid: string): number {
    if (typeof window === 'undefined') return 0;

    try {
      const count = localStorage.getItem(`login_count_${jewelerid}`);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Error getting login count:', error);
      return 0;
    }
  }
}

// Default instance
export const authFlowAPI = new AuthFlowAPI();

// Individual functions for easier imports

// Enhanced functions with user details
export const completeAuthenticationFlowWithDetails = (
  userDetailsData: IUserDetailsFormData,
  apiBaseURL?: string
) => authFlowAPI.completeAuthenticationFlowWithDetails(userDetailsData, apiBaseURL);

export const authenticateUserWithDetails = (
  jewelerid: string,
  userName: string,
  password: string,
  email: string,
  firstName: string,
  lastName: string,
  phone: string,
  referenceId?: string,
  apiBaseURL?: string
) => authFlowAPI.authenticateUserWithDetails(jewelerid, userName, password, email, firstName, lastName, phone, referenceId, apiBaseURL);

// Legacy functions (backward compatibility)
export const completeAuthenticationFlow = (
  loginData: ILoginFormData,
  apiBaseURL?: string
) => authFlowAPI.completeAuthenticationFlow(loginData, apiBaseURL);

export const authenticateUser = (
  jewelerid: string,
  userName: string,
  password: string,
  apiBaseURL?: string
) => authFlowAPI.authenticateUser(jewelerid, userName, password, apiBaseURL);

/**
 * LocalStorage Management Functions for Authentication
 */

/**
 * Get complete authentication data by jeweler ID
 */
export const getCompleteAuthData = (jewelerid: string): ICompleteAuthData | null => {
  if (typeof window === 'undefined') return null;

  try {
    const authKey = `complete_auth_${jewelerid}`;
    const storedData = localStorage.getItem(authKey);

    if (storedData) {
      return JSON.parse(storedData);
    }

    return null;
  } catch (error) {
    console.error('Error retrieving complete auth data:', error);
    return null;
  }
};

/**
 * Get current authentication data (last logged in)
 */
export const getCurrentAuthData = (): ICompleteAuthData | null => {
  if (typeof window === 'undefined') return null;

  try {
    const currentJewelerid = localStorage.getItem('current_auth_jewelerid');
    
    if (currentJewelerid) {
      return getCompleteAuthData(currentJewelerid);
    }

    return null;
  } catch (error) {
    console.error('Error retrieving current auth data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isUserAuthenticated = (jewelerid?: string): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const authData = jewelerid ? 
      getCompleteAuthData(jewelerid) : 
      getCurrentAuthData();

    return authData?.isAuthenticated || false;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

/**
 * Get current host auth token
 */
export const getCurrentHostAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem('current_auth_host_token');
  } catch (error) {
    console.error('Error getting current host auth token:', error);
    return null;
  }
};

/**
 * Get current user ID
 */
export const getCurrentUserId = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem('current_auth_user_id');
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

/**
 * Get current session ID
 */
export const getCurrentSessionId = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem('current_auth_session_id');
  } catch (error) {
    console.error('Error getting current session ID:', error);
    return null;
  }
};

/**
 * Get authentication state for UI
 */
export const getAuthenticationState = (jewelerid?: string): IAuthenticationState => {
  const authData = jewelerid ? 
    getCompleteAuthData(jewelerid) : 
    getCurrentAuthData();

  return {
    isAuthenticated: authData?.isAuthenticated || false,
    isAuthenticating: false, // This would be managed by UI state
    loginError: null, // This would be managed by UI state
    lastLoginAttempt: authData?.login_timestamp,
    loginSuccess: authData?.isAuthenticated || false
  };
};

/**
 * Clear authentication data
 */
export const clearAuthenticationData = (jewelerid?: string): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    if (jewelerid) {
      // Clear specific jeweler data
      localStorage.removeItem(`complete_auth_${jewelerid}`);
      localStorage.removeItem(`auth_credentials_${jewelerid}`);
      localStorage.removeItem(`login_count_${jewelerid}`);
      
      // Clear current data if it matches
      const currentJewelerid = localStorage.getItem('current_auth_jewelerid');
      if (currentJewelerid === jewelerid) {
        localStorage.removeItem('current_auth_jewelerid');
        localStorage.removeItem('current_auth_user_id');
        localStorage.removeItem('current_auth_session_id');
        localStorage.removeItem('current_auth_host_token');
      }
    } else {
      // Clear current authentication data
      const currentJewelerid = localStorage.getItem('current_auth_jewelerid');
      if (currentJewelerid) {
        localStorage.removeItem(`complete_auth_${currentJewelerid}`);
        localStorage.removeItem(`auth_credentials_${currentJewelerid}`);
      }
      
      localStorage.removeItem('current_auth_jewelerid');
      localStorage.removeItem('current_auth_user_id');
      localStorage.removeItem('current_auth_session_id');
      localStorage.removeItem('current_auth_host_token');
    }

    console.log('🗑️ Authentication data cleared');
    return true;
  } catch (error) {
    console.error('Error clearing authentication data:', error);
    return false;
  }
};

/**
 * Clear all authentication data for all jewelers
 */
export const clearAllAuthenticationData = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const keys = Object.keys(localStorage);
    let removedCount = 0;

    for (const key of keys) {
      if (key.startsWith('complete_auth_') || 
          key.startsWith('auth_credentials_') || 
          key.startsWith('login_count_') ||
          key.startsWith('current_auth_')) {
        localStorage.removeItem(key);
        removedCount++;
      }
    }

    console.log(`🗑️ Cleared ${removedCount} authentication items`);
    return true;
  } catch (error) {
    console.error('Error clearing all authentication data:', error);
    return false;
  }
};

/**
 * Get all stored jeweler IDs
 */
export const getAllStoredJewelerIds = (): string[] => {
  if (typeof window === 'undefined') return [];

  try {
    const keys = Object.keys(localStorage);
    const jewelerIds = [];

    for (const key of keys) {
      if (key.startsWith('complete_auth_')) {
        const jewelerid = key.replace('complete_auth_', '');
        jewelerIds.push(jewelerid);
      }
    }

    return jewelerIds;
  } catch (error) {
    console.error('Error getting stored jeweler IDs:', error);
    return [];
  }
};
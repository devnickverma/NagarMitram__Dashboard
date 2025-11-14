/**
 * Authentication API for AshiD Diamonds
 * Handles login, logout, and token management
 */

import { apiClient } from './client';
import { ILoginRequest, ILoginResponse, IApiResponse } from './types';

export class AuthAPI {
  /**
   * Login user with credentials
   */
  async login(credentials: ILoginRequest): Promise<IApiResponse<ILoginResponse>> {
    try {
      const response = await apiClient.post<ILoginResponse>('/api/authentication/login', credentials);
      
      if (response.success && response.data) {
        // Store authentication data in client
        apiClient.setAuth(
          response.data.token,
          response.data.refreshToken,
          response.data.expiresIn,
          response.data.userInfo
        );
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      // Clear authentication data
      apiClient.clearAuth();
      
      // Note: Add logout API call if endpoint exists
      // await apiClient.post('/api/authentication/logout');
      
      // Dispatch logout event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    } catch (error) {
      // Still clear auth even if API call fails
      apiClient.clearAuth();
      throw error;
    }
  }

  /**
   * Get current authentication state
   */
  getAuthState() {
    return apiClient.getAuth();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Get current user info
   */
  getCurrentUser() {
    const auth = apiClient.getAuth();
    return auth.userInfo;
  }

  /**
   * Check if token is expired or about to expire
   */
  isTokenExpired(): boolean {
    const auth = apiClient.getAuth();
    if (!auth.expiresAt) return false;
    
    // Consider token expired if it expires in the next 5 minutes
    const expirationBuffer = 5 * 60 * 1000; // 5 minutes in milliseconds
    return new Date(auth.expiresAt).getTime() - Date.now() < expirationBuffer;
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<void> {
    // Note: Implement when refresh token endpoint is available
    throw new Error('Token refresh not implemented - endpoint not available in API');
  }

  /**
   * Listen to authentication events
   */
  onAuthChange(callback: (isAuthenticated: boolean) => void): () => void {
    if (typeof window === 'undefined') {
      return () => {}; // No-op for SSR
    }

    const handleAuthExpired = () => callback(false);
    const handleAuthLogout = () => callback(false);
    
    window.addEventListener('auth:expired', handleAuthExpired);
    window.addEventListener('auth:logout', handleAuthLogout);
    
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }
}

// Export singleton instance
export const authAPI = new AuthAPI();
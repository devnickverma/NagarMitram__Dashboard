/**
 * API Client for AshiD Diamonds Integration
 * Handles HTTP requests, authentication, and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { IApiResponse, IApiError, IApiConfig, IAuthState } from './types';

class ApiClient {
  private axiosInstance: AxiosInstance;
  private config: IApiConfig;
  private authState: IAuthState = {
    isAuthenticated: false,
    token: null,
    refreshToken: null,
    expiresAt: null,
    userInfo: null,
  };

  constructor(config: Partial<IApiConfig> = {}) {
    this.config = {
      baseURL: process.env.NEXT_PUBLIC_ASHID_API_URL || 'https://aichatbotbeta.ashidiamonds.com',
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...config,
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers,
    });

    this.setupInterceptors();
    this.loadAuthFromStorage();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.authState.token) {
          config.headers.Authorization = `Bearer ${this.authState.token}`;
        }
        
        // Add request timestamp for debugging
        config.headers['X-Request-Time'] = new Date().toISOString();
        
        return config;
      },
      (error) => {
        return Promise.reject(this.formatError(error));
      }
    );

    // Response interceptor - Handle responses and errors
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Check if response follows AshiD API format
        if (response.data && typeof response.data === 'object') {
          const { responseCode, responseStatus, responseMessage, responseData } = response.data;
          
          if (responseCode !== undefined) {
            // Transform AshiD API response to standard format
            return {
              ...response,
              data: {
                success: responseCode === 200 || responseCode === 1,
                data: responseData,
                message: responseMessage,
                status: responseStatus,
                originalResponse: response.data,
              } as IApiResponse,
            };
          }
        }
        
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            originalRequest.headers.Authorization = `Bearer ${this.authState.token}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.clearAuth();
            // Dispatch auth expired event
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auth:expired'));
            }
            return Promise.reject(this.formatError(refreshError));
          }
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  private formatError(error: any): IApiError {
    const now = new Date().toISOString();

    if (error.response) {
      // Server responded with error status
      const { data, status, statusText } = error.response;
      
      // Handle AshiD API error format
      if (data && data.responseMessage) {
        return {
          code: `HTTP_${status}`,
          message: data.responseMessage,
          details: {
            status,
            statusText,
            responseCode: data.responseCode,
            responseStatus: data.responseStatus,
            originalData: data,
          },
          timestamp: now,
        };
      }

      return {
        code: `HTTP_${status}`,
        message: data?.message || statusText || 'Request failed',
        details: { status, statusText, data },
        timestamp: now,
      };
    }

    if (error.request) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error - Unable to reach server',
        details: { request: error.request },
        timestamp: now,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Unknown error occurred',
      details: error,
      timestamp: now,
    };
  }

  private loadAuthFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('ashid_auth');
      if (stored) {
        const authData = JSON.parse(stored);
        
        if (authData.expiresAt && new Date(authData.expiresAt) > new Date()) {
          this.authState = authData;
        } else {
          this.clearAuth();
        }
      }
    } catch (error) {
      console.error('Failed to load auth from storage:', error);
      this.clearAuth();
    }
  }

  private saveAuthToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('ashid_auth', JSON.stringify(this.authState));
    } catch (error) {
      console.error('Failed to save auth to storage:', error);
    }
  }

  private async refreshToken(): Promise<void> {
    if (!this.authState.refreshToken) {
      throw new Error('No refresh token available');
    }

    // Note: Implement refresh token logic based on AshiD API
    // For now, clear auth as refresh endpoint is not defined in swagger
    this.clearAuth();
    throw new Error('Token refresh not implemented');
  }

  // Public authentication methods
  public setAuth(token: string, refreshToken?: string, expiresIn?: number, userInfo?: any): void {
    const expiresAt = expiresIn 
      ? new Date(Date.now() + expiresIn * 1000)
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 24 hours

    this.authState = {
      isAuthenticated: true,
      token,
      refreshToken: refreshToken || null,
      expiresAt,
      userInfo: userInfo || null,
    };

    this.saveAuthToStorage();
  }

  public clearAuth(): void {
    this.authState = {
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      expiresAt: null,
      userInfo: null,
    };

    if (typeof window !== 'undefined') {
      localStorage.removeItem('ashid_auth');
    }
  }

  public getAuth(): IAuthState {
    return { ...this.authState };
  }

  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated && 
           this.authState.token !== null &&
           (this.authState.expiresAt === null || this.authState.expiresAt > new Date());
  }

  // HTTP Methods
  public async get<T = any>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<IApiResponse<T>> {
    const response: AxiosResponse<IApiResponse<T>> = await this.axiosInstance.get(url, config);
    return response.data;
  }

  public async post<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<IApiResponse<T>> {
    const response: AxiosResponse<IApiResponse<T>> = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  public async put<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<IApiResponse<T>> {
    const response: AxiosResponse<IApiResponse<T>> = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  public async delete<T = any>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<IApiResponse<T>> {
    const response: AxiosResponse<IApiResponse<T>> = await this.axiosInstance.delete(url, config);
    return response.data;
  }

  // Utility methods
  public async healthCheck(): Promise<boolean> {
    try {
      // Use the health check function directly instead of API call
      const { quickHealthCheck } = await import('../../utils/health-checker');
      const healthStatus = await quickHealthCheck('ashi-widget-client');
      return healthStatus?.status === 'healthy';
    } catch (error) {
      console.warn('❌ [ApiClient] Health check failed:', error);
      return false;
    }
  }

  public getBaseURL(): string {
    return this.config.baseURL;
  }

  public updateConfig(newConfig: Partial<IApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update axios instance
    this.axiosInstance.defaults.baseURL = this.config.baseURL;
    this.axiosInstance.defaults.timeout = this.config.timeout;
    this.axiosInstance.defaults.headers = { ...this.axiosInstance.defaults.headers, ...this.config.headers };
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default ApiClient;
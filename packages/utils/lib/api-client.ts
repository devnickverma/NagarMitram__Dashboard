/**
 * Enhanced API Client with Bearer Token Authentication
 * Handles all API communications with automatic token management
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface IApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: any;
}

export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: IApiError;
  message?: string;
  timestamp: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  tokenType?: 'Bearer';
}

class ApiClient {
  private axiosInstance: AxiosInstance;
  private baseURL: string;
  private tokens: IAuthTokens | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api') {
    this.baseURL = baseURL;
    
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.setupInterceptors();
    this.loadTokensFromStorage();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add bearer token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${this.tokens.accessToken}`;
        }
        
        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        return config;
      },
      (error) => {
        return Promise.reject(this.formatError(error));
      }
    );

    // Response interceptor - Handle token refresh and errors
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            window.dispatchEvent(new CustomEvent('auth:token-expired'));
            return Promise.reject(this.formatError(refreshError));
          }
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatError(error: any): IApiError {
    if (error.response) {
      return {
        message: error.response.data?.message || error.message || 'API request failed',
        code: error.response.data?.code || 'API_ERROR',
        statusCode: error.response.status,
        details: error.response.data
      };
    }

    if (error.request) {
      return {
        message: 'Network error - Unable to reach server',
        code: 'NETWORK_ERROR',
        statusCode: 0,
        details: error.request
      };
    }

    return {
      message: error.message || 'Unknown error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: 0,
      details: error
    };
  }

  private loadTokensFromStorage(): void {
    try {
      const stored = localStorage.getItem('ashi_widget_tokens');
      if (stored) {
        this.tokens = JSON.parse(stored);
        
        // Check if token is expired
        if (this.tokens?.expiresAt) {
          const expiresAt = new Date(this.tokens.expiresAt);
          if (expiresAt <= new Date()) {
            this.clearTokens();
          }
        }
      }
    } catch (error) {
      console.error('Failed to load tokens from storage:', error);
      this.clearTokens();
    }
  }

  private saveTokensToStorage(): void {
    try {
      if (this.tokens) {
        localStorage.setItem('ashi_widget_tokens', JSON.stringify(this.tokens));
      } else {
        localStorage.removeItem('ashi_widget_tokens');
      }
    } catch (error) {
      console.error('Failed to save tokens to storage:', error);
    }
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      this.refreshPromise = null;
      return newToken;
    } catch (error) {
      this.refreshPromise = null;
      throw error;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        refreshToken: this.tokens?.refreshToken
      });

      const { accessToken, refreshToken, expiresAt } = response.data;
      
      this.tokens = {
        accessToken,
        refreshToken: refreshToken || this.tokens?.refreshToken,
        expiresAt,
        tokenType: 'Bearer'
      };

      this.saveTokensToStorage();
      return accessToken;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  // Public methods
  public setTokens(tokens: IAuthTokens): void {
    this.tokens = tokens;
    this.saveTokensToStorage();
  }

  public getTokens(): IAuthTokens | null {
    return this.tokens;
  }

  public clearTokens(): void {
    this.tokens = null;
    this.saveTokensToStorage();
  }

  public isAuthenticated(): boolean {
    if (!this.tokens?.accessToken) return false;
    
    if (this.tokens.expiresAt) {
      const expiresAt = new Date(this.tokens.expiresAt);
      return expiresAt > new Date();
    }
    
    return true;
  }

  // HTTP Methods
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<IApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.get(url, config);
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error as IApiError,
        timestamp: new Date().toISOString()
      };
    }
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<IApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error as IApiError,
        timestamp: new Date().toISOString()
      };
    }
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<IApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, config);
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error as IApiError,
        timestamp: new Date().toISOString()
      };
    }
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<IApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error as IApiError,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Streaming support for chat
  public async stream(url: string, data?: any, onChunk?: (chunk: string) => void): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      };

      if (this.tokens?.accessToken) {
        headers.Authorization = `Bearer ${this.tokens.accessToken}`;
      }

      const response = await fetch(`${this.baseURL}${url}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data.trim() && data !== '[DONE]') {
              onChunk?.(data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      throw this.formatError(error);
    }
  }

  // File upload support
  public async uploadFile<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<IApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress?.(progress);
          }
        }
      };

      const response: AxiosResponse<T> = await this.axiosInstance.post(url, formData, config);
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error as IApiError,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.success;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const apiClient = new ApiClient();
/**
 * Custom Quote API for AshiD Diamonds
 * Handles custom quote requests, calculations, and management
 */

import { apiClient } from './client';
import {
  ICustomQuote,
  ICustomQuoteSpecifications,
  ICustomerInfo,
  IApiResponse,
} from './types';

export class CustomQuoteAPI {
  /**
   * Get available custom quote options and templates
   */
  async getCustomQuoteOptions(): Promise<IApiResponse<{
    metals: string[];
    gemstones: string[];
    settings: string[];
    sizes: string[];
  }>> {
    try {
      return await apiClient.get('/api/customquote/options');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get custom quote templates
   */
  async getCustomQuoteTemplates(): Promise<IApiResponse<any[]>> {
    try {
      return await apiClient.get('/api/customquote/templates');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new custom quote request
   */
  async createCustomQuote(
    customerInfo: ICustomerInfo,
    specifications: ICustomQuoteSpecifications,
    additionalRequirements?: string
  ): Promise<IApiResponse<ICustomQuote>> {
    try {
      const requestData = {
        customerInfo,
        specifications,
        additionalRequirements,
      };
      
      return await apiClient.post<ICustomQuote>('/api/customquote/create', requestData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request a custom quote with detailed specifications
   */
  async requestCustomQuote(request: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    productType: string;
    specifications: Record<string, any>;
    budget?: number;
    timeline?: string;
    notes?: string;
  }): Promise<IApiResponse<ICustomQuote>> {
    try {
      return await apiClient.post<ICustomQuote>('/api/customquote/request', request);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate pricing for a custom quote
   */
  async calculateCustomQuote(request: {
    baseStyleId?: string;
    specifications: ICustomQuoteSpecifications;
    quantity?: number;
  }): Promise<IApiResponse<{
    estimatedPrice: number;
    estimatedLeadTime: string;
    breakdown: Record<string, number>;
  }>> {
    try {
      return await apiClient.post('/api/customquote/calculate', request);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all custom quotes for the current user
   */
  async getCustomQuotes(): Promise<IApiResponse<ICustomQuote[]>> {
    try {
      return await apiClient.get<ICustomQuote[]>('/api/customquote');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a specific custom quote by ID
   */
  async getCustomQuoteById(quoteId: string): Promise<IApiResponse<ICustomQuote>> {
    try {
      return await apiClient.get<ICustomQuote>(`/api/customquote/${quoteId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a custom quote
   */
  async updateCustomQuote(
    quoteId: string,
    updates: Partial<ICustomQuote>
  ): Promise<IApiResponse<ICustomQuote>> {
    try {
      return await apiClient.put<ICustomQuote>(`/api/customquote/${quoteId}`, updates);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Submit a custom quote for review
   */
  async submitCustomQuote(quoteId: string): Promise<IApiResponse<ICustomQuote>> {
    try {
      return await apiClient.post<ICustomQuote>(`/api/customquote/${quoteId}/submit`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel a custom quote
   */
  async cancelCustomQuote(quoteId: string): Promise<IApiResponse<boolean>> {
    try {
      return await apiClient.delete<boolean>(`/api/customquote/${quoteId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get custom quote history
   */
  async getCustomQuoteHistory(): Promise<IApiResponse<ICustomQuote[]>> {
    try {
      return await apiClient.get<ICustomQuote[]>('/api/customquote/history');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload design files for a custom quote
   */
  async uploadDesignFiles(
    quoteId: string,
    files: File[]
  ): Promise<IApiResponse<{ uploadedFiles: string[] }>> {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      return await apiClient.post(`/api/customquote/${quoteId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const customQuoteAPI = new CustomQuoteAPI();
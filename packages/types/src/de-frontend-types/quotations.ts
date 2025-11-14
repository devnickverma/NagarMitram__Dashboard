/**
 * Sales Quotations API for AshiD Diamonds
 * Handles quotation creation, management, and conversion
 */

import { apiClient } from './client';
import {
  IQuotation,
  IQuotationItem,
  ICreateQuotationRequest,
  IAddQuotationItemRequest,
  ICart,
  IApiResponse,
  IPaginationParams,
  ISpecificQuotation,
} from './types';

export class QuotationsAPI {
  /**
   * Create a new sales quotation
   */
  async createQuotation(data: ICreateQuotationRequest = {}): Promise<IApiResponse<IQuotation>> {
    try {
      return await apiClient.post<IQuotation>('/api/salesquotation/create', data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get quotation by ID
   */
  async getQuotation(quotationId: string): Promise<IApiResponse<IQuotation>> {
    try {
      return await apiClient.get<IQuotation>(`/api/salesquotation/${quotationId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all quotations for current user
   */
  async getQuotations(params: IPaginationParams = {}): Promise<IApiResponse<IQuotation[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `/api/salesquotation${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiClient.get<IQuotation[]>(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add item to quotation
   */
  async addItemToQuotation(data: IAddQuotationItemRequest): Promise<IApiResponse<IQuotation>> {
    try {
      return await apiClient.post<IQuotation>('/api/salesquotation/additem', data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove items from quotation
   */
  async removeItemsFromQuotation(
    quotationId: string, 
    itemIds: string[]
  ): Promise<IApiResponse<IQuotation>> {
    try {
      return await apiClient.delete<IQuotation>('/api/salesquotation/removeitems', {
        data: {
          quotationId,
          itemIds,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove single item from quotation
   */
  async removeItemFromQuotation(
    quotationId: string, 
    itemId: string
  ): Promise<IApiResponse<IQuotation>> {
    try {
      return await this.removeItemsFromQuotation(quotationId, [itemId]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update quotation item quantity
   */
  async updateQuotationItem(
    quotationId: string,
    itemId: string,
    quantity: number
  ): Promise<IApiResponse<IQuotation>> {
    try {
      return await apiClient.put<IQuotation>('/api/salesquotation/updateitem', {
        quotationId,
        itemId,
        quantity,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Move quotation to cart
   */
  async moveToCart(quotationId: string): Promise<IApiResponse<ICart>> {
    try {
      return await apiClient.post<ICart>('/api/salesquotation/movetocart', {
        quotationId,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Move specific quotation items to cart
   */
  async moveItemsToCart(
    quotationId: string,
    itemIds: string[]
  ): Promise<IApiResponse<ICart>> {
    try {
      return await apiClient.post<ICart>('/api/salesquotation/moveitemstocart', {
        quotationId,
        itemIds,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update quotation details
   */
  async updateQuotation(
    quotationId: string,
    data: Partial<ICreateQuotationRequest>
  ): Promise<IApiResponse<IQuotation>> {
    try {
      return await apiClient.put<IQuotation>(`/api/salesquotation/${quotationId}`, data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete quotation
   */
  async deleteQuotation(quotationId: string): Promise<IApiResponse<boolean>> {
    try {
      return await apiClient.delete<boolean>(`/api/salesquotation/${quotationId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get quotation summary
   */
  async getQuotationSummary(quotationId: string): Promise<IApiResponse<{
    totalItems: number;
    totalAmount: number;
    validUntil: string | null;
    status: string;
    itemsCount: Record<string, number>;
  }>> {
    try {
      const quotationResponse = await this.getQuotation(quotationId);
      
      if (quotationResponse.success) {
        const quotation = quotationResponse.data;
        
        // Calculate items count by category or type
        const itemsCount: Record<string, number> = {};
        quotation.items.forEach(item => {
          const category = item.product?.category || 'Unknown';
          itemsCount[category] = (itemsCount[category] || 0) + item.quantity;
        });

        const summary = {
          totalItems: quotation.items.reduce((total, item) => total + item.quantity, 0),
          totalAmount: quotation.totalAmount,
          validUntil: quotation.validUntil,
          status: quotation.status,
          itemsCount,
        };

        return {
          success: true,
          data: summary,
          message: 'Quotation summary calculated',
          status: 'success',
          originalResponse: quotationResponse,
        };
      }

      return quotationResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Duplicate quotation
   */
  async duplicateQuotation(
    quotationId: string,
    newData: Partial<ICreateQuotationRequest> = {}
  ): Promise<IApiResponse<IQuotation>> {
    try {
      const originalResponse = await this.getQuotation(quotationId);
      
      if (!originalResponse.success) {
        return originalResponse;
      }

      const original = originalResponse.data;
      
      // Create new quotation
      const newQuotationResponse = await this.createQuotation({
        customerName: original.items.length > 0 ? `Copy of ${original.quotationNumber}` : undefined,
        ...newData,
      });

      if (!newQuotationResponse.success) {
        return newQuotationResponse;
      }

      const newQuotation = newQuotationResponse.data;

      // Add all items from original quotation
      const addItemPromises = original.items.map(item =>
        this.addItemToQuotation({
          quotationId: newQuotation.quotationId,
          style_id: item.style_id,
          quantity: item.quantity,
        })
      );

      await Promise.allSettled(addItemPromises);

      // Return updated quotation
      return await this.getQuotation(newQuotation.quotationId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check quotation validity
   */
  async checkQuotationValidity(quotationId: string): Promise<IApiResponse<{
    isValid: boolean;
    daysRemaining: number;
    expiresAt: string | null;
  }>> {
    try {
      const quotationResponse = await this.getQuotation(quotationId);
      
      if (quotationResponse.success) {
        const quotation = quotationResponse.data;
        let isValid = true;
        let daysRemaining = 0;
        
        if (quotation.validUntil) {
          const expirationDate = new Date(quotation.validUntil);
          const now = new Date();
          const diffTime = expirationDate.getTime() - now.getTime();
          daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          isValid = daysRemaining > 0;
        }

        return {
          success: true,
          data: {
            isValid,
            daysRemaining,
            expiresAt: quotation.validUntil,
          },
          message: isValid ? 'Quotation is valid' : 'Quotation has expired',
          status: 'success',
          originalResponse: quotationResponse,
        };
      }

      return quotationResponse;
    } catch (error) {
      throw error;
    }
  }

  // ===== MISSING APIS FROM SWAGGER =====

  /**
   * Get specific sales quotation by SQID (from Swagger)
   */
  async getSpecificSalesQuotation(sqid: string): Promise<IApiResponse<ISpecificQuotation>> {
    try {
      return await apiClient.get<ISpecificQuotation>(`/api/salesquotation/${sqid}/salesquotation`);
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const quotationsAPI = new QuotationsAPI();
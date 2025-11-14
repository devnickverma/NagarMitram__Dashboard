/**
 * Cart API for AshiD Diamonds
 * Handles cart operations: add, view, update, remove, and place orders
 */

import { apiClient } from './client';
import {
  ICart,
  ICartItem,
  IAddToCartRequest,
  IPlaceOrderRequest,
  IOrder,
  IApiResponse,
  IPlaceOrderFields,
  IPlaceOrderFieldsRequest,
} from './types';

export class CartAPI {
  /**
   * Get current cart contents
   */
  async getCart(): Promise<IApiResponse<ICart>> {
    try {
      return await apiClient.get<ICart>('/api/cart');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(item: IAddToCartRequest): Promise<IApiResponse<ICart>> {
    try {
      return await apiClient.post<ICart>('/api/cart/add', item);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(
    itemId: string, 
    quantity: number
  ): Promise<IApiResponse<ICart>> {
    try {
      return await apiClient.put<ICart>('/api/cart/update', {
        itemId,
        quantity,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(itemId: string): Promise<IApiResponse<ICart>> {
    try {
      return await apiClient.delete<ICart>(`/api/cart/remove/${itemId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<IApiResponse<boolean>> {
    try {
      return await apiClient.delete<boolean>('/api/cart/clear');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Place order from current cart
   */
  async placeOrder(orderData: IPlaceOrderRequest = {}): Promise<IApiResponse<IOrder>> {
    try {
      return await apiClient.post<IOrder>('/api/cart/placeorder', orderData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get cart summary/totals
   */
  async getCartSummary(): Promise<IApiResponse<{
    totalItems: number;
    subtotal: number;
    tax: number;
    shipping: number;
    totalAmount: number;
  }>> {
    try {
      const cartResponse = await this.getCart();
      
      if (cartResponse.success) {
        const cart = cartResponse.data;
        const summary = {
          totalItems: cart.totalItems,
          subtotal: cart.subtotal,
          tax: cart.tax || 0,
          shipping: cart.shipping || 0,
          totalAmount: cart.totalAmount,
        };

        return {
          success: true,
          data: summary,
          message: 'Cart summary calculated',
          status: 'success',
          originalResponse: cartResponse,
        };
      }

      return cartResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add multiple items to cart
   */
  async addMultipleToCart(items: IAddToCartRequest[]): Promise<IApiResponse<ICart>> {
    try {
      const promises = items.map(item => this.addToCart(item));
      const responses = await Promise.allSettled(promises);
      
      let lastSuccessfulResponse: IApiResponse<ICart> | null = null;
      const errors: any[] = [];

      responses.forEach((response, index) => {
        if (response.status === 'fulfilled' && response.value.success) {
          lastSuccessfulResponse = response.value;
        } else {
          errors.push({
            index,
            item: items[index],
            error: response.status === 'rejected' ? response.reason : response.value,
          });
        }
      });

      if (lastSuccessfulResponse) {
        return {
          ...lastSuccessfulResponse,
          message: `Added ${items.length - errors.length} of ${items.length} items to cart`,
          originalResponse: { responses, errors },
        };
      }

      throw new Error('Failed to add any items to cart');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate cart before checkout
   */
  async validateCart(): Promise<IApiResponse<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }>> {
    try {
      const cartResponse = await this.getCart();
      
      if (!cartResponse.success) {
        return cartResponse;
      }

      const cart = cartResponse.data;
      const issues: string[] = [];
      const suggestions: string[] = [];

      // Check if cart is empty
      if (!cart.items || cart.items.length === 0) {
        issues.push('Cart is empty');
      }

      // Check for items with zero quantity
      const zeroQuantityItems = cart.items.filter(item => item.quantity <= 0);
      if (zeroQuantityItems.length > 0) {
        issues.push(`${zeroQuantityItems.length} items have zero or negative quantity`);
      }

      // Check for items with invalid prices
      const invalidPriceItems = cart.items.filter(item => !item.price || item.price <= 0);
      if (invalidPriceItems.length > 0) {
        issues.push(`${invalidPriceItems.length} items have invalid prices`);
      }

      // Add suggestions
      if (cart.totalAmount > 10000) {
        suggestions.push('Consider splitting large orders for better processing');
      }

      if (cart.items.length > 20) {
        suggestions.push('Large number of items - consider creating a quotation instead');
      }

      return {
        success: true,
        data: {
          isValid: issues.length === 0,
          issues,
          suggestions,
        },
        message: issues.length === 0 ? 'Cart is valid' : `Cart has ${issues.length} issues`,
        status: 'success',
        originalResponse: cartResponse,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate shipping cost
   */
  async calculateShipping(shippingAddress?: any): Promise<IApiResponse<{
    cost: number;
    method: string;
    estimatedDays: number;
  }>> {
    try {
      // Note: This would need an actual shipping calculation endpoint
      // For now, return a mock calculation
      const cartSummaryResponse = await this.getCartSummary();
      
      if (cartSummaryResponse.success) {
        const { subtotal } = cartSummaryResponse.data;
        
        // Mock shipping calculation
        let shippingCost = 0;
        let method = 'Standard';
        let estimatedDays = 5;

        if (subtotal > 500) {
          shippingCost = 0; // Free shipping
          method = 'Free Standard Shipping';
        } else if (subtotal > 100) {
          shippingCost = 15;
        } else {
          shippingCost = 25;
        }

        return {
          success: true,
          data: {
            cost: shippingCost,
            method,
            estimatedDays,
          },
          message: 'Shipping calculated',
          status: 'success',
          originalResponse: cartSummaryResponse,
        };
      }

      return cartSummaryResponse;
    } catch (error) {
      throw error;
    }
  }

  // ===== MISSING APIS FROM SWAGGER =====

  /**
   * Get required fields for placing an order
   */
  async getPlaceOrderFields(): Promise<IApiResponse<IPlaceOrderFields>> {
    try {
      return await apiClient.get<IPlaceOrderFields>('/api/cart/placeorder/getfields');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Submit place order fields with validation
   */
  async postPlaceOrderFields(request: IPlaceOrderFieldsRequest): Promise<IApiResponse<IOrder>> {
    try {
      return await apiClient.post<IOrder>('/api/cart/placeorder/postfields', request);
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const cartAPI = new CartAPI();
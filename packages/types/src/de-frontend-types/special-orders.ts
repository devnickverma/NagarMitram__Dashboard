/**
 * Special Orders API for AshiD Diamonds
 * Handles special order options and custom product variants
 */

import { apiClient } from './client';
import {
  ISpecialOrderOptions,
  ISpecialOrderVariant,
  IApiResponse,
} from './types';

export class SpecialOrdersAPI {
  /**
   * Get special order options for a product
   */
  async getSpecialOrderOptions(styleId?: string): Promise<IApiResponse<ISpecialOrderOptions>> {
    try {
      const queryParams = styleId ? `?styleId=${styleId}` : '';
      return await apiClient.get<ISpecialOrderOptions>(`/api/specialorder/special_order_options${queryParams}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check special order variant availability
   */
  async checkSpecialOrderVariant(
    styleId: string,
    variantOptions: Record<string, any>
  ): Promise<IApiResponse<ISpecialOrderVariant>> {
    try {
      return await apiClient.post<ISpecialOrderVariant>('/api/specialorder/checkspovariant', {
        styleId,
        variantOptions,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available customization options for a product category
   */
  async getCustomizationOptions(category: string): Promise<IApiResponse<{
    metals: string[];
    gemstones: string[];
    sizes: string[];
    engravings: boolean;
    customDesign: boolean;
    additionalOptions: Record<string, any>;
  }>> {
    try {
      // This would be a custom endpoint, using special order options for now
      const optionsResponse = await this.getSpecialOrderOptions();
      
      if (optionsResponse.success) {
        const options = optionsResponse.data;
        
        // Parse available options based on category
        const customizations = {
          metals: this.extractOptions(options.availableOptions, 'metal') || ['Gold', 'Platinum', 'Silver'],
          gemstones: this.extractOptions(options.availableOptions, 'gemstone') || ['Diamond', 'Ruby', 'Sapphire', 'Emerald'],
          sizes: this.extractOptions(options.availableOptions, 'size') || ['5', '6', '7', '8', '9', '10'],
          engravings: options.customizations?.includes('engraving') || true,
          customDesign: options.customizations?.includes('custom_design') || true,
          additionalOptions: options.availableOptions || {},
        };

        return {
          success: true,
          data: customizations,
          message: 'Customization options retrieved',
          status: 'success',
          originalResponse: optionsResponse,
        };
      }

      return optionsResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request special order quote
   */
  async requestSpecialOrderQuote(request: {
    styleId?: string;
    customizations: Record<string, any>;
    customerInfo: {
      name: string;
      email: string;
      phone?: string;
    };
    description: string;
    deadline?: string;
  }): Promise<IApiResponse<{
    requestId: string;
    estimatedPrice: number;
    estimatedLeadTime: string;
    contactInfo: string;
  }>> {
    try {
      return await apiClient.post<{
        requestId: string;
        estimatedPrice: number;
        estimatedLeadTime: string;
        contactInfo: string;
      }>('/api/specialorder/requestquote', request);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get special order request status
   */
  async getSpecialOrderStatus(requestId: string): Promise<IApiResponse<{
    requestId: string;
    status: 'pending' | 'approved' | 'in_production' | 'completed' | 'cancelled';
    progress: number;
    estimatedCompletion: string;
    updates: Array<{
      date: string;
      status: string;
      notes: string;
    }>;
  }>> {
    try {
      return await apiClient.get<{
        requestId: string;
        status: 'pending' | 'approved' | 'in_production' | 'completed' | 'cancelled';
        progress: number;
        estimatedCompletion: string;
        updates: Array<{
          date: string;
          status: string;
          notes: string;
        }>;
      }>(`/api/specialorder/status/${requestId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's special order history
   */
  async getSpecialOrderHistory(): Promise<IApiResponse<Array<{
    requestId: string;
    styleId?: string;
    productName: string;
    customizations: Record<string, any>;
    status: string;
    requestDate: string;
    completionDate?: string;
    totalCost: number;
  }>>> {
    try {
      return await apiClient.get<Array<{
        requestId: string;
        styleId?: string;
        productName: string;
        customizations: Record<string, any>;
        status: string;
        requestDate: string;
        completionDate?: string;
        totalCost: number;
      }>>('/api/specialorder/history');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate special order pricing
   */
  async calculateSpecialOrderPricing(
    baseStyleId: string,
    customizations: Record<string, any>
  ): Promise<IApiResponse<{
    basePrice: number;
    customizationCosts: Record<string, number>;
    totalAdditionalCost: number;
    finalPrice: number;
    breakdown: Array<{
      item: string;
      cost: number;
      description: string;
    }>;
  }>> {
    try {
      const variantResponse = await this.checkSpecialOrderVariant(baseStyleId, customizations);
      
      if (variantResponse.success) {
        const variant = variantResponse.data;
        
        // Mock pricing calculation (in real implementation, this would be server-calculated)
        const basePrice = 1000; // This would come from the base product
        const additionalCost = variant.additionalCost || 0;
        
        const breakdown = [
          {
            item: 'Base Product',
            cost: basePrice,
            description: 'Starting price for base design',
          },
        ];

        if (additionalCost > 0) {
          breakdown.push({
            item: 'Customizations',
            cost: additionalCost,
            description: 'Additional cost for custom modifications',
          });
        }

        const finalPrice = basePrice + additionalCost;

        return {
          success: true,
          data: {
            basePrice,
            customizationCosts: { customizations: additionalCost },
            totalAdditionalCost: additionalCost,
            finalPrice,
            breakdown,
          },
          message: 'Special order pricing calculated',
          status: 'success',
          originalResponse: variantResponse,
        };
      }

      return variantResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload design files for custom order
   */
  async uploadDesignFiles(
    requestId: string,
    files: File[]
  ): Promise<IApiResponse<{
    uploadedFiles: Array<{
      filename: string;
      url: string;
      size: number;
    }>;
  }>> {
    try {
      const formData = new FormData();
      formData.append('requestId', requestId);
      
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      return await apiClient.post<{
        uploadedFiles: Array<{
          filename: string;
          url: string;
          size: number;
        }>;
      }>('/api/specialorder/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      throw error;
    }
  }

  // ===== MISSING APIS FROM SWAGGER =====

  /**
   * Add special order item to cart
   */
  async addSpecialOrderToCart(request: {
    itemcd: string;
    quantity: number;
    specifications: Record<string, any>;
    estimatedPrice?: number;
    estimatedLeadTime?: string;
    specialInstructions?: string;
  }): Promise<IApiResponse<{
    cartId: string;
    itemAdded: boolean;
    estimatedTotal: number;
  }>> {
    try {
      return await apiClient.post('/api/specialorder/cart/add', request);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get special order FAQs and information
   */
  async getSpecialOrderInfo(): Promise<IApiResponse<{
    faq: Array<{
      question: string;
      answer: string;
    }>;
    process: Array<{
      step: number;
      title: string;
      description: string;
      duration: string;
    }>;
    policies: {
      cancellation: string;
      modification: string;
      warranty: string;
      returns: string;
    };
  }>> {
    try {
      // This would typically be a static content endpoint
      const info = {
        faq: [
          {
            question: 'How long does a special order take?',
            answer: 'Special orders typically take 4-8 weeks depending on complexity.',
          },
          {
            question: 'Can I modify my order after placing it?',
            answer: 'Modifications are possible within 48 hours of placing the order.',
          },
          {
            question: 'What customizations are available?',
            answer: 'We offer metal type, gemstone selection, size adjustments, and custom engravings.',
          },
        ],
        process: [
          {
            step: 1,
            title: 'Consultation',
            description: 'Discuss your requirements with our design team',
            duration: '1-2 days',
          },
          {
            step: 2,
            title: 'Design & Approval',
            description: 'Review and approve the custom design',
            duration: '3-5 days',
          },
          {
            step: 3,
            title: 'Production',
            description: 'Crafting your custom piece',
            duration: '3-6 weeks',
          },
          {
            step: 4,
            title: 'Quality Check',
            description: 'Final inspection and certification',
            duration: '1-2 days',
          },
          {
            step: 5,
            title: 'Delivery',
            description: 'Secure shipping to your location',
            duration: '2-3 days',
          },
        ],
        policies: {
          cancellation: 'Orders can be cancelled within 48 hours. After production begins, cancellation fees may apply.',
          modification: 'Design modifications are accepted within 48 hours of order confirmation.',
          warranty: 'All custom pieces come with a 1-year warranty covering manufacturing defects.',
          returns: 'Custom orders are final sale unless there are manufacturing defects.',
        },
      };

      return {
        success: true,
        data: info,
        message: 'Special order information retrieved',
        status: 'success',
        originalResponse: null,
      };
    } catch (error) {
      throw error;
    }
  }

  // Helper method to extract options from the API response
  private extractOptions(availableOptions: Record<string, any> | undefined, key: string): string[] | null {
    if (!availableOptions || !availableOptions[key]) {
      return null;
    }
    
    const options = availableOptions[key];
    if (Array.isArray(options)) {
      return options;
    }
    
    if (typeof options === 'object') {
      return Object.keys(options);
    }
    
    return null;
  }
}

// Export singleton instance
export const specialOrdersAPI = new SpecialOrdersAPI();
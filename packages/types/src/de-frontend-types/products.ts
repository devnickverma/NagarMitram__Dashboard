/**
 * Products API for AshiD Diamonds
 * Handles product search, details, variants, and specifications
 */

import { apiClient } from './client';
import {
  IProduct,
  IProductDetails,
  IProductVariant,
  IProductSearchParams,
  IProductSearchResponse,
  IApiResponse,
  IPaginationParams,
  IRelatedProduct,
  IProductMeasurement,
  IStyleHistory,
  IInventoryStatusRequest,
  IInventoryStatus,
  ISimilarStyle,
  IRecentlyViewed,
} from './types';

export class ProductsAPI {
  /**
   * Search for products
   */
  async searchProducts(params: IProductSearchParams = {}): Promise<IApiResponse<IProductSearchResponse>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.query) queryParams.append('query', params.query);
      if (params.category) queryParams.append('category', params.category);
      if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `/api/products/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiClient.get<IProductSearchResponse>(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get product details by style ID
   */
  async getProductDetails(styleId: string): Promise<IApiResponse<IProductDetails>> {
    try {
      return await apiClient.get<IProductDetails>(`/api/products/${styleId}/details`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get product variants by style ID
   */
  async getProductVariants(styleId: string): Promise<IApiResponse<IProductVariant[]>> {
    try {
      return await apiClient.get<IProductVariant[]>(`/api/products/${styleId}/variants`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get product specifications by style ID
   */
  async getProductSpecifications(styleId: string): Promise<IApiResponse<Record<string, any>>> {
    try {
      return await apiClient.get<Record<string, any>>(`/api/products/${styleId}/specifications`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get multiple products by style IDs
   */
  async getProductsByIds(styleIds: string[]): Promise<IApiResponse<IProduct[]>> {
    try {
      const promises = styleIds.map(id => this.getProductDetails(id));
      const responses = await Promise.allSettled(promises);
      
      const products: IProduct[] = [];
      responses.forEach((response) => {
        if (response.status === 'fulfilled' && response.value.success) {
          products.push(response.value.data);
        }
      });

      return {
        success: true,
        data: products,
        message: `Retrieved ${products.length} of ${styleIds.length} products`,
        status: 'success',
        originalResponse: responses,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get featured or trending products
   */
  async getFeaturedProducts(limit: number = 10): Promise<IApiResponse<IProduct[]>> {
    try {
      // Use search with specific parameters for featured products
      return await this.searchProducts({ 
        limit, 
        sortBy: 'featured',
        sortOrder: 'desc' 
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    category: string, 
    params: IPaginationParams = {}
  ): Promise<IApiResponse<IProductSearchResponse>> {
    try {
      return await this.searchProducts({
        category,
        ...params,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get product recommendations based on a product
   */
  async getProductRecommendations(
    styleId: string, 
    limit: number = 5
  ): Promise<IApiResponse<IProduct[]>> {
    try {
      // Get product details first to understand category/type
      const productResponse = await this.getProductDetails(styleId);
      
      if (!productResponse.success) {
        throw new Error('Failed to get product details for recommendations');
      }

      const product = productResponse.data;
      
      // Search for similar products in the same category
      const recommendationsResponse = await this.searchProducts({
        category: product.category,
        limit: limit + 1, // Get one extra to exclude the original product
      });

      if (recommendationsResponse.success) {
        // Filter out the original product and limit results
        const recommendations = recommendationsResponse.data.products
          .filter(p => p.style_id !== styleId)
          .slice(0, limit);

        return {
          success: true,
          data: recommendations,
          message: `Found ${recommendations.length} recommendations`,
          status: 'success',
          originalResponse: recommendationsResponse,
        };
      }

      return recommendationsResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check product availability
   */
  async checkAvailability(styleId: string, variantId?: string): Promise<IApiResponse<boolean>> {
    try {
      if (variantId) {
        // Check specific variant availability
        const variantsResponse = await this.getProductVariants(styleId);
        if (variantsResponse.success) {
          const variant = variantsResponse.data.find(v => v.variantId === variantId);
          return {
            success: true,
            data: variant?.availability || false,
            message: variant ? 'Variant availability checked' : 'Variant not found',
            status: 'success',
            originalResponse: variantsResponse,
          };
        }
        return variantsResponse;
      } else {
        // Check general product availability
        const productResponse = await this.getProductDetails(styleId);
        if (productResponse.success) {
          return {
            success: true,
            data: productResponse.data.availability || false,
            message: 'Product availability checked',
            status: 'success',
            originalResponse: productResponse,
          };
        }
        return productResponse;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get product images
   */
  async getProductImages(styleId: string): Promise<IApiResponse<string[]>> {
    try {
      const productResponse = await this.getProductDetails(styleId);
      
      if (productResponse.success) {
        const images = productResponse.data.images || [];
        if (productResponse.data.imageUrl && !images.includes(productResponse.data.imageUrl)) {
          images.unshift(productResponse.data.imageUrl);
        }

        return {
          success: true,
          data: images,
          message: `Retrieved ${images.length} images`,
          status: 'success',
          originalResponse: productResponse,
        };
      }

      return productResponse;
    } catch (error) {
      throw error;
    }
  }

  // ===== MISSING APIS FROM SWAGGER =====

  /**
   * Get related products that share connection with another product
   */
  async getRelatedProducts(styleId: string): Promise<IApiResponse<IRelatedProduct[]>> {
    try {
      return await apiClient.get<IRelatedProduct[]>(`/api/products/${styleId}/related`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get product measurements based on various criteria & jewelry type
   */
  async getProductMeasurement(styleId: string): Promise<IApiResponse<IProductMeasurement>> {
    try {
      return await apiClient.get<IProductMeasurement>(`/api/products/${styleId}/measurement`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get product purchase history by memo & invoice for given style id
   */
  async getStyleHistory(styleId: string): Promise<IApiResponse<IStyleHistory>> {
    try {
      return await apiClient.get<IStyleHistory>(`/api/products/${styleId}/stylehistory`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get inventory status for given style IDs
   */
  async getInventoryStatus(request: IInventoryStatusRequest): Promise<IApiResponse<IInventoryStatus[]>> {
    try {
      return await apiClient.post<IInventoryStatus[]>('/api/products/inventory-status', request);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get similar products that share common attributes with given product
   */
  async getSimilarStyles(styleId: string): Promise<IApiResponse<ISimilarStyle[]>> {
    try {
      return await apiClient.get<ISimilarStyle[]>(`/api/products/${styleId}/similarstyles`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get list of recently viewed products by logged in user
   */
  async getRecentlyViewed(): Promise<IApiResponse<IRecentlyViewed[]>> {
    try {
      return await apiClient.get<IRecentlyViewed[]>('/api/products/recentlyviewed');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get products details by multiple style IDs (from Swagger)
   */
  async getMultipleProductDetails(styleIds: string[]): Promise<IApiResponse<IProduct[]>> {
    try {
      return await apiClient.post<IProduct[]>('/api/products/details', { style_ids: styleIds });
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const productsAPI = new ProductsAPI();
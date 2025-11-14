/**
 * Wishlist API for AshiD Diamonds
 * Handles wishlist operations: view, add, remove, and move to cart
 */

import { apiClient } from './client';
import {
  IWishlist,
  IWishlistItem,
  IAddToWishlistRequest,
  ICart,
  IApiResponse,
  IPaginationParams,
} from './types';

export class WishlistAPI {
  /**
   * Get current user's wishlist
   */
  async getWishlist(params: IPaginationParams = {}): Promise<IApiResponse<IWishlist>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `/api/wishlist${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiClient.get<IWishlist>(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add item to wishlist
   */
  async addToWishlist(item: IAddToWishlistRequest): Promise<IApiResponse<IWishlist>> {
    try {
      return await apiClient.post<IWishlist>('/api/wishlist/add', item);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(itemId: string): Promise<IApiResponse<IWishlist>> {
    try {
      return await apiClient.delete<IWishlist>(`/api/wishlist/remove/${itemId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove multiple items from wishlist
   */
  async removeMultipleFromWishlist(itemIds: string[]): Promise<IApiResponse<IWishlist>> {
    try {
      return await apiClient.delete<IWishlist>('/api/wishlist/remove', {
        data: { itemIds },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clear entire wishlist
   */
  async clearWishlist(): Promise<IApiResponse<boolean>> {
    try {
      return await apiClient.delete<boolean>('/api/wishlist/clear');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Move wishlist item to cart
   */
  async moveToCart(itemId: string, quantity: number = 1): Promise<IApiResponse<ICart>> {
    try {
      return await apiClient.post<ICart>('/api/wishlist/movetocart', {
        itemId,
        quantity,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Move multiple wishlist items to cart
   */
  async moveMultipleToCart(items: Array<{
    itemId: string;
    quantity: number;
  }>): Promise<IApiResponse<ICart>> {
    try {
      return await apiClient.post<ICart>('/api/wishlist/movemultipletocart', {
        items,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Move entire wishlist to cart
   */
  async moveAllToCart(defaultQuantity: number = 1): Promise<IApiResponse<ICart>> {
    try {
      const wishlistResponse = await this.getWishlist();
      
      if (!wishlistResponse.success) {
        return wishlistResponse;
      }

      const items = wishlistResponse.data.items.map(item => ({
        itemId: item.id,
        quantity: defaultQuantity,
      }));

      return await this.moveMultipleToCart(items);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if product is in wishlist
   */
  async isInWishlist(styleId: string): Promise<IApiResponse<boolean>> {
    try {
      const wishlistResponse = await this.getWishlist();
      
      if (wishlistResponse.success) {
        const isInWishlist = wishlistResponse.data.items.some(
          item => item.style_id === styleId
        );

        return {
          success: true,
          data: isInWishlist,
          message: isInWishlist ? 'Product is in wishlist' : 'Product is not in wishlist',
          status: 'success',
          originalResponse: wishlistResponse,
        };
      }

      return wishlistResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get wishlist item by style ID
   */
  async getWishlistItem(styleId: string): Promise<IApiResponse<IWishlistItem | null>> {
    try {
      const wishlistResponse = await this.getWishlist();
      
      if (wishlistResponse.success) {
        const item = wishlistResponse.data.items.find(
          item => item.style_id === styleId
        );

        return {
          success: true,
          data: item || null,
          message: item ? 'Wishlist item found' : 'Wishlist item not found',
          status: 'success',
          originalResponse: wishlistResponse,
        };
      }

      return wishlistResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get wishlist summary
   */
  async getWishlistSummary(): Promise<IApiResponse<{
    totalItems: number;
    categories: Record<string, number>;
    priceRange: {
      min: number;
      max: number;
      average: number;
    } | null;
    recentlyAdded: IWishlistItem[];
  }>> {
    try {
      const wishlistResponse = await this.getWishlist();
      
      if (wishlistResponse.success) {
        const { items } = wishlistResponse.data;
        
        // Calculate categories
        const categories: Record<string, number> = {};
        items.forEach(item => {
          const category = item.product?.category || 'Unknown';
          categories[category] = (categories[category] || 0) + 1;
        });

        // Calculate price range
        let priceRange = null;
        const prices = items
          .map(item => item.product?.price)
          .filter((price): price is number => price !== undefined && price > 0);

        if (prices.length > 0) {
          priceRange = {
            min: Math.min(...prices),
            max: Math.max(...prices),
            average: prices.reduce((sum, price) => sum + price, 0) / prices.length,
          };
        }

        // Get recently added items (last 5)
        const recentlyAdded = [...items]
          .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
          .slice(0, 5);

        const summary = {
          totalItems: items.length,
          categories,
          priceRange,
          recentlyAdded,
        };

        return {
          success: true,
          data: summary,
          message: 'Wishlist summary calculated',
          status: 'success',
          originalResponse: wishlistResponse,
        };
      }

      return wishlistResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update wishlist item notes
   */
  async updateWishlistItem(
    itemId: string, 
    notes: string
  ): Promise<IApiResponse<IWishlist>> {
    try {
      return await apiClient.put<IWishlist>(`/api/wishlist/update/${itemId}`, {
        notes,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Share wishlist (get shareable link or data)
   */
  async shareWishlist(): Promise<IApiResponse<{
    shareUrl: string;
    shareData: {
      totalItems: number;
      items: Array<{
        styleId: string;
        name: string;
        price?: number;
        imageUrl?: string;
      }>;
    };
  }>> {
    try {
      const wishlistResponse = await this.getWishlist();
      
      if (wishlistResponse.success) {
        const { items } = wishlistResponse.data;
        
        const shareData = {
          totalItems: items.length,
          items: items.map(item => ({
            styleId: item.style_id,
            name: item.product?.name || 'Unknown Product',
            price: item.product?.price,
            imageUrl: item.product?.imageUrl,
          })),
        };

        // Generate a mock share URL (in real implementation, this would be a server-generated link)
        const shareUrl = `${window.location.origin}/shared-wishlist/${btoa(JSON.stringify(shareData))}`;

        return {
          success: true,
          data: {
            shareUrl,
            shareData,
          },
          message: 'Wishlist share data generated',
          status: 'success',
          originalResponse: wishlistResponse,
        };
      }

      return wishlistResponse;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const wishlistAPI = new WishlistAPI();
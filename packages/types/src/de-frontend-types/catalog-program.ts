/**
 * Catalog/Program API for AshiD Diamonds
 * Handles catalog and program management functionality
 */

import { apiClient } from './client';
import {
  IProgramInfo,
  ICatalogInfo,
  ISpecialOrderInfo,
  IProduct,
  IApiResponse,
} from './types';

export class CatalogProgramAPI {
  /**
   * Get program information by PPCC ID
   */
  async getProgramInfo(ppccId: string): Promise<IApiResponse<IProgramInfo>> {
    try {
      return await apiClient.get<IProgramInfo>(`/api/catalogprogram/ppcc/${ppccId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all available programs
   */
  async getAllPrograms(): Promise<IApiResponse<IProgramInfo[]>> {
    try {
      return await apiClient.get<IProgramInfo[]>('/api/catalogprogram/programs');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get catalog information by catalog ID
   */
  async getCatalogInfo(catalogId: string): Promise<IApiResponse<ICatalogInfo>> {
    try {
      return await apiClient.get<ICatalogInfo>(`/api/catalogprogram/catalog/${catalogId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all available catalogs
   */
  async getAllCatalogs(): Promise<IApiResponse<ICatalogInfo[]>> {
    try {
      return await apiClient.get<ICatalogInfo[]>('/api/catalogprogram/catalogs');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get active catalogs (currently effective)
   */
  async getActiveCatalogs(): Promise<IApiResponse<ICatalogInfo[]>> {
    try {
      return await apiClient.get<ICatalogInfo[]>('/api/catalogprogram/catalogs/active');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get products by program/catalog
   */
  async getProductsByProgram(ppccId: string, params?: {
    page?: number;
    limit?: number;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<IApiResponse<{
    products: IProduct[];
    totalCount: number;
    programInfo: IProgramInfo;
  }>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.category) queryParams.append('category', params.category);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `/api/catalogprogram/ppcc/${ppccId}/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiClient.get(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get products by catalog
   */
  async getProductsByCatalog(catalogId: string, params?: {
    page?: number;
    limit?: number;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<IApiResponse<{
    products: IProduct[];
    totalCount: number;
    catalogInfo: ICatalogInfo;
  }>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.category) queryParams.append('category', params.category);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `/api/catalogprogram/catalog/${catalogId}/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiClient.get(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get special order information for a program
   */
  async getSpecialOrderInfo(ppccId: string): Promise<IApiResponse<ISpecialOrderInfo>> {
    try {
      return await apiClient.get<ISpecialOrderInfo>(`/api/catalogprogram/ppcc/${ppccId}/specialorder`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if a product is available in a specific program
   */
  async checkProductInProgram(ppccId: string, itemcd: string): Promise<IApiResponse<{
    available: boolean;
    programInfo: IProgramInfo;
    productInfo?: IProduct;
    specialOrderAvailable?: boolean;
  }>> {
    try {
      return await apiClient.get(`/api/catalogprogram/ppcc/${ppccId}/product/${itemcd}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get program pricing for a product
   */
  async getProgramPricing(ppccId: string, itemcd: string): Promise<IApiResponse<{
    regularPrice: number;
    programPrice: number;
    discount: number;
    discountPercentage: number;
    specialOffers?: Array<{
      offerType: string;
      offerValue: number;
      description: string;
      validUntil?: string;
    }>;
  }>> {
    try {
      return await apiClient.get(`/api/catalogprogram/ppcc/${ppccId}/product/${itemcd}/pricing`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search programs by criteria
   */
  async searchPrograms(criteria: {
    programName?: string;
    catalogName?: string;
    active?: boolean;
    hasSpecialOrder?: boolean;
  }): Promise<IApiResponse<IProgramInfo[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (criteria.programName) queryParams.append('programName', criteria.programName);
      if (criteria.catalogName) queryParams.append('catalogName', criteria.catalogName);
      if (criteria.active !== undefined) queryParams.append('active', criteria.active.toString());
      if (criteria.hasSpecialOrder !== undefined) queryParams.append('hasSpecialOrder', criteria.hasSpecialOrder.toString());

      const url = `/api/catalogprogram/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiClient.get<IProgramInfo[]>(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get program categories
   */
  async getProgramCategories(ppccId: string): Promise<IApiResponse<Array<{
    categoryName: string;
    categoryId: string;
    productCount: number;
    subcategories?: Array<{
      name: string;
      id: string;
      productCount: number;
    }>;
  }>>> {
    try {
      return await apiClient.get(`/api/catalogprogram/ppcc/${ppccId}/categories`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get catalog expiry information
   */
  async getCatalogExpiry(catalogId: string): Promise<IApiResponse<{
    catalogId: string;
    catalogName: string;
    expiryDate: string;
    daysUntilExpiry: number;
    isExpired: boolean;
    renewalInfo?: {
      newCatalogId?: string;
      renewalDate?: string;
      migrationRequired?: boolean;
    };
  }>> {
    try {
      return await apiClient.get(`/api/catalogprogram/catalog/${catalogId}/expiry`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Subscribe to program updates
   */
  async subscribeToProgramUpdates(ppccId: string, email: string): Promise<IApiResponse<boolean>> {
    try {
      return await apiClient.post<boolean>(`/api/catalogprogram/ppcc/${ppccId}/subscribe`, {
        email,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get program statistics
   */
  async getProgramStatistics(ppccId: string): Promise<IApiResponse<{
    totalProducts: number;
    categoriesCount: number;
    averagePrice: number;
    priceRange: {
      min: number;
      max: number;
    };
    specialOrderEnabled: boolean;
    popularCategories: Array<{
      categoryName: string;
      productCount: number;
    }>;
  }>> {
    try {
      return await apiClient.get(`/api/catalogprogram/ppcc/${ppccId}/statistics`);
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const catalogProgramAPI = new CatalogProgramAPI();
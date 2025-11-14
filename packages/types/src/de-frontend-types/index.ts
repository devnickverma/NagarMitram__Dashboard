/**
 * AshiD Diamonds API - Main Export File
 * 
 * This file exports all API services and types for easy import throughout the application.
 * Organized by feature and functionality for the AshiD widget integration.
 * 
 * Usage:
 * import { authAPI, productsAPI, cartAPI, api } from '@/services/api';
 * 
 * Or import specific APIs:
 * import { authAPI } from '@/services/api/auth';
 * import { productsAPI } from '@/services/api/products';
 */

// Core API Client and Types
export { apiClient, default as ApiClient } from './client';
export * from './types';

// Individual API Services
export { authAPI, AuthAPI } from './auth';
export { productsAPI, ProductsAPI } from './products';
export { cartAPI, CartAPI } from './cart';
export { quotationsAPI, QuotationsAPI } from './quotations';
export { wishlistAPI, WishlistAPI } from './wishlist';
export { specialOrdersAPI, SpecialOrdersAPI } from './special-orders';
export { customQuoteAPI, CustomQuoteAPI } from './customquote';
export { orderStatusAPI, OrderStatusAPI } from './order-status';
export { catalogProgramAPI, CatalogProgramAPI } from './catalog-program';
export { emailAPI, EmailAPI } from './email';

// Internal User API (Primary - replaces direct Freshchat user creation)
export { 
  internalUserAPI,
  InternalUserAPI,
  createInternalUser,
  createInternalUserSimplified,
  getStoredInternalUser,
  getLastCreatedInternalUserId,
  getLastCreatedInternalFreshchatUserId,
  getFreshchatUserIdByUserId,
  getUserIdsByReferenceId,
  getAllStoredInternalUsers,
  isInternalUserStoredLocally,
  getHostAuthToken
} from './internal-user';

// Session API (Primary - replaces existing session management)
export {
  sessionAPI,
  SessionAPI,
  createSession,
  createSessionSimplified,
  getStoredSession,
  getLastCreatedSessionId,
  getCurrentActiveSessionId,
  getUserIdBySessionId,
  getAllStoredSessions,
  isSessionStoredLocally,
  removeStoredSession,
  clearAllStoredSessions,
  setCurrentActiveSession
} from './session';

// Chat API (Primary - handles AI chat with Freshchat handoff)
export {
  chatAPI,
  ChatAPI,
  sendChatMessage,
  sendSimpleChatMessage,
  getConversationMapping,
  getConversationMappingByConversationId,
  getConversationMappingByFreshchatId,
  getAllConversationMappings,
  isConversationHandedOffToHuman,
  clearConversationMapping,
  clearAllConversationMappings
} from './chat';

// Complete Authentication Flow (Primary - handles login → createUser → createSession)
export {
  authFlowAPI,
  AuthFlowAPI,
  // Enhanced functions with user details
  completeAuthenticationFlowWithDetails,
  authenticateUserWithDetails,
  // Legacy functions (backward compatibility)
  completeAuthenticationFlow,
  authenticateUser,
  // Storage and state management
  getCompleteAuthData,
  getCurrentAuthData,
  isUserAuthenticated,
  getCurrentHostAuthToken,
  getCurrentUserId,
  getCurrentSessionId,
  getAuthenticationState,
  clearAuthenticationData,
  clearAllAuthenticationData,
  getAllStoredJewelerIds
} from './auth-flow';

// Freshchat API (For messaging and conversation management)
export { 
  freshchatAPI, 
  FreshchatAPI, 
  createFreshchatUser, 
  getFreshchatUserByReferenceId, 
  getFreshchatUserById, 
  updateFreshchatUserProperties,
  sendFreshchatMessage,
  sendFreshchatTextMessage,
  sendFreshchatMessageWithQuickReplies,
  sendFreshchatMessageWithUrlButtons,
  sendFreshchatMessageWithMixedButtons,
  getFreshchatConversation,
  getStoredFreshchatUser,
  getLastCreatedFreshchatUserId,
  getAllStoredFreshchatUsers,
  removeStoredFreshchatUser,
  clearAllStoredFreshchatUsers,
  isUserStoredLocally
} from './freshchat';

// Import the new APIs for the unified class
import { customQuoteAPI } from './customquote';
import { orderStatusAPI } from './order-status';
import { catalogProgramAPI } from './catalog-program';
import { emailAPI } from './email';
import { freshchatAPI } from './freshchat';
import { internalUserAPI } from './internal-user';
import { sessionAPI } from './session';
import { chatAPI } from './chat';
import { authFlowAPI } from './auth-flow';

// Re-export common types for convenience
export type {
  // Response Types
  IApiResponse,
  IApiError,
  
  // Authentication Types
  ILoginRequest,
  ILoginResponse,
  IAuthState,
  
  // Product Types
  IProduct,
  IProductDetails,
  IProductVariant,
  IProductSearchParams,
  IProductSearchResponse,
  
  // Cart Types
  ICart,
  ICartItem,
  IAddToCartRequest,
  IPlaceOrderRequest,
  IOrder,
  
  // Quotation Types
  IQuotation,
  IQuotationItem,
  ICreateQuotationRequest,
  IAddQuotationItemRequest,
  
  // Wishlist Types
  IWishlist,
  IWishlistItem,
  IAddToWishlistRequest,
  
  // Special Order Types
  ISpecialOrderOptions,
  ISpecialOrderVariant,
  
  // Chat Types (for future use)
  IChatMessage,
  IChatSession,
  
  // Internal User API Types
  IInternalUserRequest,
  IInternalUserResponse,
  
  // Session API Types
  ICreateSessionRequest,
  ICreateSessionResponse,
  
  // Chat API Types
  IChatRequest,
  IChatResponse,
  IChatAgentState,
  IChatStateMessage,
  IConversationMapping,
  
  // Authentication Flow Types
  ILoginFormData,
  IUserDetailsFormData,
  ICompleteLoginFormData,
  IAuthenticationState,
  IStoredAuthCredentials,
  IHostTokens,
  ICompleteAuthFlow,
  ICompleteAuthData,
  
  // Freshchat Types
  IFreshchatUserRequest,
  IFreshchatUserResponse,
  IFreshchatUser,
  IFreshchatProperty,
  IFreshchatAPIPayload,
  IFreshchatUsersResponse,
  IFreshchatSendMessageRequest,
  IFreshchatSendMessageResponse,
  IFreshchatGetConversationResponse,
  IFreshchatMessage,
  IFreshchatConversation,
  IFreshchatMessagePart,
  IFreshchatQuickReplyButton,
  IFreshchatUrlButton,
  IFreshchatReplyPart,
  
  // Utility Types
  IPaginationParams,
  IPaginatedResponse,
  IApiConfig,
} from './types';

/**
 * Unified API Service Class
 * Provides a single interface to all API services with shared configuration
 */
export class AshiDAPI {
  // Individual API services
  // public readonly auth = authAPI;
  // public readonly products = productsAPI;
  // public readonly cart = cartAPI;
  // public readonly quotations = quotationsAPI;
  // public readonly wishlist = wishlistAPI;
  // public readonly specialOrders = specialOrdersAPI;
  // public readonly customQuote = customQuoteAPI;
  // public readonly orderStatus = orderStatusAPI;
  // public readonly catalogProgram = catalogProgramAPI;
  // public readonly email = emailAPI;
  // public readonly freshchat = freshchatAPI;
  // public readonly internalUser = internalUserAPI;
  // public readonly session = sessionAPI;
  // public readonly chat = chatAPI;
  // public readonly authFlow = authFlowAPI;
  
  // API client for direct access
  // public readonly client = apiClient;

  constructor() {
    // Initialize any global configurations or event listeners
    this.setupGlobalErrorHandling();
  }

  /**
   * Setup global error handling for all API calls
   */
  private setupGlobalErrorHandling(): void {
    if (typeof window !== 'undefined') {
      // Listen for authentication errors
      window.addEventListener('auth:expired', () => {
        console.warn('Authentication expired - user needs to login again');
        // Could dispatch to a global state management system here
      });

      // Listen for logout events
      window.addEventListener('auth:logout', () => {
        console.info('User logged out');
        // Could dispatch to a global state management system here
      });
    }
  }

  /**
   * Initialize the API with configuration
   */
  public initialize(config: Partial<{
    baseURL: string;
    timeout: number;
    retries: number;
    defaultHeaders: Record<string, string>;
  }> = {}): void {
    // this.client.updateConfig({
    //   baseURL: config.baseURL || process.env.NEXT_PUBLIC_ASHID_API_URL || 'https://aichatbotbeta.ashidiamonds.com',
    //   timeout: config.timeout || 30000,
    //   retries: config.retries || 3,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Accept': 'application/json',
    //     ...config.defaultHeaders,
    //   },
    // });

    console.info('AshiD API initialized', {
      baseURL: config.baseURL || process.env.NEXT_PUBLIC_ASHID_API_URL || 'https://aichatbotbeta.ashidiamonds.com',
      isAuthenticated: false,
    });
  }

  /**
   * Check overall API health
   */
  public async healthCheck(): Promise<{
    client: boolean;
    authentication: boolean;
    timestamp: string;
  }> {
    const timestamp = new Date().toISOString();
    
    try {
      // const clientHealth = await this.client.healthCheck();
      // const authHealth = this.auth.isAuthenticated();
      const clientHealth = true;
      const authHealth = false;

      return {
        client: clientHealth,
        authentication: authHealth,
        timestamp,
      };
    } catch (error) {
      return {
        client: false,
        authentication: false,
        timestamp,
      };
    }
  }

  /**
   * Clear all cached data and authentication
   */
  public clearAllData(): void {
    // this.auth.logout();
    
    // Clear any other cached data if needed
    if (typeof window !== 'undefined') {
      // Could clear other localStorage items related to the API
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith('ashid_') || key.startsWith('ashi_')
      );
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
    }
  }

  /**
   * Get current user context (auth + basic info)
   */
  public getCurrentContext(): {
    isAuthenticated: boolean;
    user: any;
    permissions: string[];
    lastActivity: Date | null;
  } {
    // const auth = this.auth.getAuthState();
    const auth = { isAuthenticated: false, userInfo: null, expiresAt: null };
    
    return {
      isAuthenticated: auth.isAuthenticated,
      user: auth.userInfo,
      permissions: [], // Could be extracted from JWT or user info
      lastActivity: auth.expiresAt,
    };
  }

  /**
   * Setup authentication from stored credentials
   */
  public async restoreAuthentication(): Promise<boolean> {
    try {
      // const auth = this.auth.getAuthState();
      const auth = { isAuthenticated: false, token: null };
      
      if (auth.isAuthenticated && auth.token) {
        // Verify token is still valid by making a test API call
        // const healthCheck = await this.client.healthCheck();
        const healthCheck = true;
        
        if (!healthCheck) {
          // Token is invalid, clear it
          // this.auth.logout();
          return false;
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      // this.auth.logout();
      return false;
    }
  }
}

// Export singleton instance for easy use
export const api = new AshiDAPI();

// Default export for convenience
export default api;

/**
 * React Hook for API (example for future implementation)
 * This would be implemented with React Query or similar
 */
export const useAshiDAPI = () => {
  return {
    api,
    isAuthenticated: false, // api.auth.isAuthenticated(),
    healthCheck: api.healthCheck,
    initialize: api.initialize,
  };
};

/**
 * API Configuration Constants
 */
export const API_CONFIG = {
  BASE_URLS: {
    PRODUCTION: 'https://aichatbotbeta.ashidiamonds.com',
    STAGING: 'https://staging.ashidiamonds.com', // If exists
    DEVELOPMENT: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  TIMEOUTS: {
    DEFAULT: 30000,
    UPLOAD: 60000,
    DOWNLOAD: 45000,
  },
  RETRY_CONFIG: {
    ATTEMPTS: 3,
    DELAY: 1000,
    BACKOFF_FACTOR: 2,
  },
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
} as const;

/**
 * API Endpoints Reference
 * Useful for documentation and testing
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/authentication/login',
  },
  PRODUCTS: {
    SEARCH: '/api/products/search',
    DETAILS: '/api/products/{style_id}/details',
    VARIANTS: '/api/products/{style_id}/variants',
    SPECIFICATIONS: '/api/products/{style_id}/specifications',
  },
  CART: {
    VIEW: '/api/cart',
    ADD: '/api/cart/add',
    PLACE_ORDER: '/api/cart/placeorder',
  },
  QUOTATIONS: {
    CREATE: '/api/salesquotation/create',
    ADD_ITEM: '/api/salesquotation/additem',
    REMOVE_ITEMS: '/api/salesquotation/removeitems',
    MOVE_TO_CART: '/api/salesquotation/movetocart',
  },
  WISHLIST: {
    VIEW: '/api/wishlist',
    ADD: '/api/wishlist/add',
    MOVE_TO_CART: '/api/wishlist/movetocart',
  },
  SPECIAL_ORDERS: {
    OPTIONS: '/api/specialorder/special_order_options',
    CHECK_VARIANT: '/api/specialorder/checkspovariant',
  },
} as const;

console.info('AshiD API module loaded', {
  version: '1.0.0',
  endpoints: Object.keys(API_ENDPOINTS).length,
  services: ['auth', 'products', 'cart', 'quotations', 'wishlist', 'specialOrders', 'customQuote', 'orderStatus', 'catalogProgram', 'email', 'internalUser', 'session', 'chat', 'authFlow', 'freshchat'],
});
# AshiD Diamonds API Integration

This directory contains a comprehensive API structure for integrating with the AshiD Diamonds backend API. The API is organized by feature and functionality, providing a clean and maintainable interface for the ashi_widget service.

## 🏗️ Architecture Overview

The API structure follows a modular design pattern with the following components:

- **Client**: Core HTTP client with authentication and error handling
- **Services**: Feature-specific API modules (auth, products, cart, etc.)
- **Types**: TypeScript definitions for all API interactions
- **Index**: Main export file providing unified access

## 📁 File Structure

```
src/services/api/
├── README.md                 # This documentation
├── index.ts                  # Main export file - import everything from here
├── client.ts                 # Core API client with HTTP handling
├── types.ts                  # TypeScript type definitions
├── auth.ts                   # Authentication API
├── products.ts               # Products search and details API
├── cart.ts                   # Shopping cart operations API
├── quotations.ts             # Sales quotations API
├── wishlist.ts               # Wishlist management API
└── special-orders.ts         # Special orders and customizations API
```

## 🚀 Quick Start

### Basic Usage

```typescript
// Import the main API instance
import { api } from '@/services/api';

// Initialize the API (optional - uses defaults)
api.initialize({
  baseURL: 'https://aichatbotbeta.ashidiamonds.com',
  timeout: 30000,
});

// Use individual services
const loginResponse = await api.auth.login({
  jewelerid: 'YOUR_JEWELER_ID',
  userName: 'YOUR_USERNAME',
  password: 'YOUR_PASSWORD',
});

const products = await api.products.searchProducts({
  query: 'diamond ring',
  limit: 10,
});
```

### Individual Service Imports

```typescript
// Import specific services
import { authAPI, productsAPI, cartAPI } from '@/services/api';

// Use directly
const user = await authAPI.login(credentials);
const searchResults = await productsAPI.searchProducts({ query: 'engagement ring' });
const cart = await cartAPI.getCart();
```

## 🔐 Authentication

The API uses JWT Bearer token authentication. All API calls (except login) require authentication.

### Login Example

```typescript
import { api } from '@/services/api';

try {
  const response = await api.auth.login({
    jewelerid: '12345',
    userName: 'john.doe',
    password: 'secure_password',
  });

  if (response.success) {
    console.log('Logged in successfully:', response.data.userInfo);
    // Token is automatically stored and used for subsequent requests
  }
} catch (error) {
  console.error('Login failed:', error);
}
```

### Authentication State

```typescript
// Check if user is authenticated
const isAuthenticated = api.auth.isAuthenticated();

// Get current user info
const userInfo = api.auth.getCurrentUser();

// Listen for auth changes
const unsubscribe = api.auth.onAuthChange((isAuthenticated) => {
  if (!isAuthenticated) {
    // Redirect to login or show login modal
    console.log('User logged out or token expired');
  }
});
```

## 🛍️ API Services

### Products API

Search, browse, and get detailed product information.

```typescript
import { api } from '@/services/api';

// Search products
const searchResults = await api.products.searchProducts({
  query: 'diamond earrings',
  category: 'earrings',
  minPrice: 500,
  maxPrice: 2000,
  page: 1,
  limit: 20,
});

// Get product details
const product = await api.products.getProductDetails('STYLE123');

// Get product variants
const variants = await api.products.getProductVariants('STYLE123');

// Get recommendations
const recommendations = await api.products.getProductRecommendations('STYLE123', 5);
```

### Cart API

Manage shopping cart operations.

```typescript
import { api } from '@/services/api';

// Get current cart
const cart = await api.cart.getCart();

// Add item to cart
const updatedCart = await api.cart.addToCart({
  style_id: 'STYLE123',
  quantity: 1,
  variantId: 'VAR456',
});

// Place order
const order = await api.cart.placeOrder({
  shippingAddress: { /* address data */ },
  paymentMethod: 'credit_card',
});
```

### Quotations API

Create and manage sales quotations.

```typescript
import { api } from '@/services/api';

// Create quotation
const quotation = await api.quotations.createQuotation({
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  validityDays: 30,
});

// Add items to quotation
await api.quotations.addItemToQuotation({
  quotationId: quotation.data.quotationId,
  style_id: 'STYLE123',
  quantity: 2,
});

// Move quotation to cart
const cart = await api.quotations.moveToCart(quotation.data.quotationId);
```

### Wishlist API

Manage user wishlists.

```typescript
import { api } from '@/services/api';

// Get wishlist
const wishlist = await api.wishlist.getWishlist();

// Add to wishlist
await api.wishlist.addToWishlist({
  style_id: 'STYLE123',
  notes: 'For anniversary gift',
});

// Move to cart
await api.wishlist.moveToCart('WISHLIST_ITEM_ID', 1);
```

### Special Orders API

Handle custom orders and special requests.

```typescript
import { api } from '@/services/api';

// Get customization options
const options = await api.specialOrders.getSpecialOrderOptions('STYLE123');

// Check variant availability
const variant = await api.specialOrders.checkSpecialOrderVariant('STYLE123', {
  metal: 'platinum',
  gemstone: 'sapphire',
  size: '7',
});

// Request quote for custom order
const quote = await api.specialOrders.requestSpecialOrderQuote({
  styleId: 'STYLE123',
  customizations: { metal: 'platinum', engraving: 'Forever Yours' },
  customerInfo: {
    name: 'Jane Doe',
    email: 'jane@example.com',
  },
  description: 'Custom engagement ring with sapphire center stone',
});
```

## 🎯 Error Handling

The API provides comprehensive error handling with structured error objects.

```typescript
import { api } from '@/services/api';

try {
  const response = await api.products.searchProducts({ query: 'rings' });
  
  if (response.success) {
    // Handle successful response
    console.log('Products:', response.data.products);
  } else {
    // Handle API-level errors
    console.error('API Error:', response.message);
  }
} catch (error) {
  // Handle network or other errors
  console.error('Request failed:', error);
  
  if (error.code === 'NETWORK_ERROR') {
    // Show offline message
  } else if (error.code === 'HTTP_401') {
    // Redirect to login
  }
}
```

## 📊 Response Format

All API responses follow a consistent format based on the AshiD Diamonds API specification:

```typescript
interface IApiResponse<T> {
  success: boolean;           // Indicates if the request was successful
  data: T;                   // The actual response data
  message: string;           // Human-readable message
  status: string;            // Response status
  originalResponse?: any;    // Original API response for debugging
}
```

### AshiD API Format

The original AshiD API returns responses in this format:

```json
{
  "responseCode": 200,
  "responseStatus": "success",
  "responseMessage": "Request processed successfully",
  "responseData": { /* actual data */ }
}
```

The API client automatically transforms this to the standard format.

## ⚙️ Configuration

### Environment Variables

Set these environment variables for API configuration:

```bash
# API Base URL
NEXT_PUBLIC_ASHID_API_URL=https://aichatbotbeta.ashidiamonds.com

# Timeout settings (optional)
NEXT_PUBLIC_API_TIMEOUT=30000

# Development settings
NEXT_PUBLIC_API_DEBUG=true
```

### Runtime Configuration

```typescript
import { api } from '@/services/api';

// Configure API at runtime
api.initialize({
  baseURL: process.env.NEXT_PUBLIC_ASHID_API_URL,
  timeout: 30000,
  retries: 3,
  defaultHeaders: {
    'X-Client-Version': '1.0.0',
  },
});
```

## 🔧 Development Tools

### Health Check

```typescript
import { api } from '@/services/api';

// Check API health
const health = await api.healthCheck();
console.log('API Health:', health);
// Output: { client: true, authentication: true, timestamp: "2024-..." }
```

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
NEXT_PUBLIC_API_DEBUG=true
```

### Testing

```typescript
// Mock API for testing
import { ApiClient } from '@/services/api';

const mockClient = new ApiClient({
  baseURL: 'http://localhost:3001/mock-api',
});

// Use in tests
const mockAPI = new AshiDAPI();
mockAPI.client = mockClient;
```

## 🚦 Rate Limiting & Best Practices

### Rate Limiting

The API client includes built-in retry logic and respects rate limits:

- **Retries**: 3 attempts with exponential backoff
- **Timeout**: 30 seconds default
- **Concurrent Requests**: Limited by browser (typically 6 per domain)

### Best Practices

1. **Cache Responses**: Use React Query or similar for caching
2. **Batch Requests**: Group related API calls when possible
3. **Error Boundaries**: Implement error boundaries for API failures
4. **Loading States**: Always show loading indicators
5. **Offline Support**: Handle network errors gracefully

```typescript
// Example with caching (using React Query)
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

function useProducts(searchParams) {
  return useQuery({
    queryKey: ['products', searchParams],
    queryFn: () => api.products.searchProducts(searchParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

## 🔄 Migration Guide

If you're migrating from the old API structure:

### Old Way
```typescript
// Old import structure
import { sessionAPI } from '@/services/session-api';
import { productAPI } from '@/services/product-api';

// Old usage
const products = await productAPI.searchProducts(params);
```

### New Way
```typescript
// New unified import
import { api } from '@/services/api';

// New usage
const products = await api.products.searchProducts(params);
```

## 📝 Contributing

When adding new API endpoints:

1. Add types to `types.ts`
2. Create or update the appropriate service file
3. Export from `index.ts`
4. Add to the `AshiDAPI` class
5. Update this documentation

### Example: Adding New Endpoint

```typescript
// 1. Add types to types.ts
export interface INewFeature {
  id: string;
  name: string;
}

// 2. Add to appropriate service file or create new one
export class NewFeatureAPI {
  async getFeature(id: string): Promise<IApiResponse<INewFeature>> {
    return await apiClient.get(`/api/newfeature/${id}`);
  }
}

// 3. Export from index.ts
export { newFeatureAPI } from './new-feature';

// 4. Add to AshiDAPI class
export class AshiDAPI {
  public readonly newFeature = newFeatureAPI;
}
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the API server allows requests from your domain
2. **Authentication Failures**: Check if tokens are expired or invalid
3. **Network Errors**: Verify API base URL and network connectivity
4. **Type Errors**: Ensure all types are properly imported and used

### Debug Information

```typescript
// Enable detailed logging
localStorage.setItem('ashid_api_debug', 'true');

// Check current configuration
console.log('API Config:', api.client.getBaseURL());
console.log('Auth State:', api.auth.getAuthState());
```

## 📞 Support

For API-related issues:

1. Check the browser console for detailed error messages
2. Verify API endpoint availability using the Swagger UI
3. Check authentication status and token validity
4. Review network requests in browser developer tools

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-30  
**Compatible with**: AshiD Diamonds API v1
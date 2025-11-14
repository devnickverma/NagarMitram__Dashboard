/**
 * API Testing Suite for AshiD Diamonds Integration
 * Tests all API endpoints using the provided JWT token
 */

import { api } from './index';

// Test configuration
const TEST_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://aichatbotbeta.ashidiamonds.com',
  timeout: 30000,
  // JWT Token from environment variable - NEVER hardcode tokens!
  token: process.env.TEST_JWT_TOKEN || 'MISSING_TEST_JWT_TOKEN_IN_ENV',
};

/**
 * Test Results Interface
 */
interface TestResult {
  endpoint: string;
  method: string;
  status: 'success' | 'failed' | 'error';
  responseTime: number;
  statusCode?: number;
  data?: any;
  error?: string;
  timestamp: string;
}

/**
 * API Test Runner Class
 */
export class APITestRunner {
  private results: TestResult[] = [];
  
  constructor() {
    // Initialize API with test configuration
    api.initialize({
      baseURL: TEST_CONFIG.baseURL,
      timeout: TEST_CONFIG.timeout,
    });
    
    // Set authentication token
    api.client.setAuth(TEST_CONFIG.token, '');
  }

  /**
   * Record test result
   */
  private recordResult(result: TestResult): void {
    this.results.push(result);
    console.log(`[${result.status.toUpperCase()}] ${result.method} ${result.endpoint} - ${result.responseTime}ms`);
    
    if (result.status === 'failed' || result.status === 'error') {
      console.error(`  Error: ${result.error}`);
    } else {
      console.log(`  Status: ${result.statusCode}, Data keys: ${result.data ? Object.keys(result.data).join(', ') : 'none'}`);
    }
  }

  /**
   * Test authentication (verify token)
   */
  async testAuthentication(): Promise<void> {
    console.log('\n🔐 Testing Authentication...');
    
    const startTime = Date.now();
    
    try {
      // Test if current token is valid by checking auth state
      const isAuthenticated = api.auth.isAuthenticated();
      const userInfo = api.auth.getCurrentUser();
      
      const result: TestResult = {
        endpoint: '/auth/verify',
        method: 'GET',
        status: isAuthenticated ? 'success' : 'failed',
        responseTime: Date.now() - startTime,
        statusCode: isAuthenticated ? 200 : 401,
        data: { isAuthenticated, userInfo },
        error: isAuthenticated ? undefined : 'Token not set or invalid',
        timestamp: new Date().toISOString(),
      };
      
      this.recordResult(result);
    } catch (error) {
      this.recordResult({
        endpoint: '/auth/verify',
        method: 'GET',
        status: 'error',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Test Products API
   */
  async testProductsAPI(): Promise<void> {
    console.log('\n🛍️ Testing Products API...');

    // Test 1: Search products without parameters
    await this.testEndpoint(
      'Products Search (no params)',
      'GET',
      '/api/products/search',
      () => api.products.searchProducts()
    );

    // Test 2: Search products with query
    await this.testEndpoint(
      'Products Search (with query)',
      'GET',
      '/api/products/search?query=diamond',
      () => api.products.searchProducts({ query: 'diamond', limit: 10 })
    );

    // Test 3: Search products with category filter
    await this.testEndpoint(
      'Products Search (with category)',
      'GET',
      '/api/products/search?category=rings',
      () => api.products.searchProducts({ category: 'rings', limit: 5 })
    );

    // Test 4: Get product details (using a mock style ID)
    await this.testEndpoint(
      'Product Details',
      'GET',
      '/api/products/STYLE123/details',
      () => api.products.getProductDetails('STYLE123')
    );

    // Test 5: Get product variants
    await this.testEndpoint(
      'Product Variants',
      'GET',
      '/api/products/STYLE123/variants',
      () => api.products.getProductVariants('STYLE123')
    );

    // Test 6: Get product recommendations
    await this.testEndpoint(
      'Product Recommendations',
      'GET',
      '/api/products/STYLE123/recommendations',
      () => api.products.getProductRecommendations('STYLE123', 5)
    );
  }

  /**
   * Test Cart API
   */
  async testCartAPI(): Promise<void> {
    console.log('\n🛒 Testing Cart API...');

    // Test 1: Get current cart
    await this.testEndpoint(
      'Get Cart',
      'GET',
      '/api/cart',
      () => api.cart.getCart()
    );

    // Test 2: Add item to cart
    await this.testEndpoint(
      'Add to Cart',
      'POST',
      '/api/cart/add',
      () => api.cart.addToCart({
        style_id: 'STYLE123',
        quantity: 1,
        variantId: 'VAR456',
      })
    );

    // Test 3: Update cart item
    await this.testEndpoint(
      'Update Cart Item',
      'PUT',
      '/api/cart/update',
      () => api.cart.updateCartItem('CART_ITEM_123', { quantity: 2 })
    );

    // Test 4: Remove cart item
    await this.testEndpoint(
      'Remove Cart Item',
      'DELETE',
      '/api/cart/remove/CART_ITEM_123',
      () => api.cart.removeFromCart('CART_ITEM_123')
    );
  }

  /**
   * Test Quotations API
   */
  async testQuotationsAPI(): Promise<void> {
    console.log('\n📋 Testing Quotations API...');

    // Test 1: Create quotation
    await this.testEndpoint(
      'Create Quotation',
      'POST',
      '/api/salesquotation/create',
      () => api.quotations.createQuotation({
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        validityDays: 30,
      })
    );

    // Test 2: Get quotations
    await this.testEndpoint(
      'Get Quotations',
      'GET',
      '/api/salesquotation',
      () => api.quotations.getQuotations()
    );

    // Test 3: Add item to quotation (using mock quotation ID)
    await this.testEndpoint(
      'Add Item to Quotation',
      'POST',
      '/api/salesquotation/additem',
      () => api.quotations.addItemToQuotation({
        quotationId: 'QUOTE123',
        style_id: 'STYLE123',
        quantity: 1,
      })
    );
  }

  /**
   * Test Wishlist API
   */
  async testWishlistAPI(): Promise<void> {
    console.log('\n❤️ Testing Wishlist API...');

    // Test 1: Get wishlist
    await this.testEndpoint(
      'Get Wishlist',
      'GET',
      '/api/wishlist',
      () => api.wishlist.getWishlist()
    );

    // Test 2: Add to wishlist
    await this.testEndpoint(
      'Add to Wishlist',
      'POST',
      '/api/wishlist/add',
      () => api.wishlist.addToWishlist({
        style_id: 'STYLE123',
        notes: 'Test wishlist item',
      })
    );

    // Test 3: Check if item is in wishlist
    await this.testEndpoint(
      'Check Wishlist Item',
      'GET',
      '/api/wishlist/check/STYLE123',
      () => api.wishlist.isInWishlist('STYLE123')
    );
  }

  /**
   * Test Special Orders API
   */
  async testSpecialOrdersAPI(): Promise<void> {
    console.log('\n⭐ Testing Special Orders API...');

    // Test 1: Get special order options
    await this.testEndpoint(
      'Get Special Order Options',
      'GET',
      '/api/specialorder/special_order_options',
      () => api.specialOrders.getSpecialOrderOptions()
    );

    // Test 2: Get special order options for specific style
    await this.testEndpoint(
      'Get Special Order Options (with style)',
      'GET',
      '/api/specialorder/special_order_options?styleId=STYLE123',
      () => api.specialOrders.getSpecialOrderOptions('STYLE123')
    );

    // Test 3: Check special order variant
    await this.testEndpoint(
      'Check Special Order Variant',
      'POST',
      '/api/specialorder/checkspovariant',
      () => api.specialOrders.checkSpecialOrderVariant('STYLE123', {
        metal: 'platinum',
        gemstone: 'sapphire',
        size: '7',
      })
    );

    // Test 4: Get customization options
    await this.testEndpoint(
      'Get Customization Options',
      'GET',
      '/api/customization/rings',
      () => api.specialOrders.getCustomizationOptions('rings')
    );
  }

  /**
   * Generic test endpoint helper
   */
  private async testEndpoint(
    name: string,
    method: string,
    endpoint: string,
    apiCall: () => Promise<any>
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await apiCall();
      const responseTime = Date.now() - startTime;
      
      const result: TestResult = {
        endpoint: endpoint,
        method: method,
        status: response.success ? 'success' : 'failed',
        responseTime,
        statusCode: response.success ? 200 : 400,
        data: response.data,
        error: response.success ? undefined : response.message,
        timestamp: new Date().toISOString(),
      };
      
      this.recordResult(result);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      this.recordResult({
        endpoint: endpoint,
        method: method,
        status: 'error',
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Run all API tests
   */
  async runAllTests(): Promise<TestResult[]> {
    console.log('🚀 Starting AshiD API Test Suite');
    console.log(`Base URL: ${TEST_CONFIG.baseURL}`);
    console.log(`Token: ${TEST_CONFIG.token.substring(0, 50)}...`);
    console.log('=' * 80);

    const startTime = Date.now();

    // Run all test suites
    await this.testAuthentication();
    await this.testProductsAPI();
    await this.testCartAPI();
    await this.testQuotationsAPI();
    await this.testWishlistAPI();
    await this.testSpecialOrdersAPI();

    const totalTime = Date.now() - startTime;

    // Generate summary
    this.generateSummary(totalTime);

    return this.results;
  }

  /**
   * Generate test summary
   */
  private generateSummary(totalTime: number): void {
    console.log('\n' + '=' * 80);
    console.log('📊 TEST SUMMARY');
    console.log('=' * 80);

    const summary = {
      total: this.results.length,
      success: this.results.filter(r => r.status === 'success').length,
      failed: this.results.filter(r => r.status === 'failed').length,
      errors: this.results.filter(r => r.status === 'error').length,
    };

    console.log(`Total Tests: ${summary.total}`);
    console.log(`✅ Successful: ${summary.success}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`🚨 Errors: ${summary.errors}`);
    console.log(`⏱️ Total Time: ${totalTime}ms`);
    console.log(`📈 Success Rate: ${((summary.success / summary.total) * 100).toFixed(1)}%`);

    // Show failed/error tests
    const failedTests = this.results.filter(r => r.status !== 'success');
    if (failedTests.length > 0) {
      console.log('\n🔍 FAILED/ERROR TESTS:');
      failedTests.forEach(test => {
        console.log(`  - ${test.method} ${test.endpoint}: ${test.error}`);
      });
    }

    // Show performance stats
    const avgResponseTime = this.results.reduce((sum, r) => sum + r.responseTime, 0) / this.results.length;
    const maxResponseTime = Math.max(...this.results.map(r => r.responseTime));
    const minResponseTime = Math.min(...this.results.map(r => r.responseTime));

    console.log('\n⚡ PERFORMANCE STATS:');
    console.log(`  Average Response Time: ${avgResponseTime.toFixed(1)}ms`);
    console.log(`  Max Response Time: ${maxResponseTime}ms`);
    console.log(`  Min Response Time: ${minResponseTime}ms`);

    console.log('\n' + '=' * 80);
  }

  /**
   * Export results to JSON
   */
  exportResults(): string {
    return JSON.stringify({
      summary: {
        testRun: new Date().toISOString(),
        baseURL: TEST_CONFIG.baseURL,
        totalTests: this.results.length,
        successfulTests: this.results.filter(r => r.status === 'success').length,
        failedTests: this.results.filter(r => r.status === 'failed').length,
        errorTests: this.results.filter(r => r.status === 'error').length,
      },
      results: this.results,
    }, null, 2);
  }
}

/**
 * Quick test function for immediate execution
 */
export async function testAshiDAPI(): Promise<void> {
  const testRunner = new APITestRunner();
  await testRunner.runAllTests();
  
  // Export results to console for debugging
  const exportedResults = testRunner.exportResults();
  console.log('\n📋 EXPORTED RESULTS (copy this for detailed analysis):');
  console.log(exportedResults);
}

// Export for use in other files
export { TestResult, APITestRunner };
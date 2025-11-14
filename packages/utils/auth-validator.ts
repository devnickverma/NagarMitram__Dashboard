/**
 * Authentication Validation Utilities
 * 
 * @description
 * Reusable functions for API key validation and client configuration.
 * Replaces the /api/auth/validate endpoint with function-based approach.
 * 
 * @features
 * - API key validation
 * - Client configuration management
 * - Origin validation
 * - Input sanitization
 * 
 * @author CSR Agent Team
 * @since 1.0.0
 */

export interface IAuthValidationOptions {
  checkOrigin?: boolean;
  includeClientConfig?: boolean;
  strictValidation?: boolean;
}

export interface IAuthValidationRequest {
  apiKey: string;
  origin?: string;
}

export interface IClientConfig {
  name: string;
  allowedOrigins: string[];
  config: string;
  features: string[];
}

export interface IAuthValidationResult {
  success: boolean;
  data?: {
    valid: boolean;
    client?: IClientConfig;
    timestamp: string;
    apiKey?: string;
  };
  error?: {
    message: string;
    code: string;
    status: number;
  };
}

/**
 * Load valid API keys from environment or fallback
 */
function getValidApiKeys(): Set<string> {
  if (typeof process !== 'undefined' && process.env) {
    const apiKeysEnv = process.env.VALID_API_KEYS;
    if (apiKeysEnv) {
      try {
        const keys = JSON.parse(apiKeysEnv);
        if (Array.isArray(keys)) {
          return new Set(keys);
        }
      } catch (error) {
        console.warn('❌ [AuthValidator] Invalid VALID_API_KEYS format, using fallback');
      }
    }
  }
  
  // Fallback for client-side or missing env
  return new Set([
    'demo-key-development-only',
    'test-key-development-only',
    'build-key'
  ]);
}

/**
 * Load client configurations from environment or fallback
 */
function getClientConfigs(): Record<string, IClientConfig> {
  if (typeof process !== 'undefined' && process.env) {
    const configsEnv = process.env.CLIENT_CONFIGS;
    if (configsEnv) {
      try {
        const configs = JSON.parse(configsEnv);
        if (typeof configs === 'object' && configs !== null) {
          // Validate no wildcard origins
          const hasWildcard = Object.values(configs).some((config: any) => 
            config.allowedOrigins && config.allowedOrigins.includes('*')
          );
          
          if (!hasWildcard) {
            return configs;
          } else {
            console.warn('❌ [AuthValidator] Wildcard origins not allowed, using fallback');
          }
        }
      } catch (error) {
        console.warn('❌ [AuthValidator] Invalid CLIENT_CONFIGS format, using fallback');
      }
    }
  }
  
  // Fallback for client-side or missing env
  return {
    'demo-key-development-only': {
      name: 'Demo Client',
      allowedOrigins: ['http://localhost:3000', 'http://localhost:3001'],
      config: 'default',
      features: ['chat', 'call']
    },
    'test-key-development-only': {
      name: 'Test Client',
      allowedOrigins: ['http://localhost:3001'],
      config: 'compact',
      features: ['chat']
    },
    'build-key': {
      name: 'Build Client',
      allowedOrigins: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
      config: 'default',
      features: ['chat', 'call']
    }
  };
}

/**
 * Validate input data
 */
function validateAuthInput(data: any): { apiKey?: string; origin?: string; errors: string[] } {
  const errors: string[] = [];
  const result: { apiKey?: string; origin?: string; errors: string[] } = { errors };

  // Validate apiKey
  if (!data.apiKey) {
    errors.push('API key is required');
  } else if (typeof data.apiKey !== 'string') {
    errors.push('API key must be a string');
  } else if (data.apiKey.length < 3 || data.apiKey.length > 100) {
    errors.push('API key must be between 3 and 100 characters');
  } else if (!/^[a-zA-Z0-9\-_]+$/.test(data.apiKey)) {
    errors.push('API key contains invalid characters');
  } else {
    result.apiKey = data.apiKey.trim();
  }

  // Validate origin (optional)
  if (data.origin) {
    if (typeof data.origin !== 'string') {
      errors.push('Origin must be a string');
    } else if (data.origin.length > 2048) {
      errors.push('Origin URL too long');
    } else {
      try {
        new URL(data.origin);
        result.origin = data.origin.trim();
      } catch {
        errors.push('Invalid origin URL format');
      }
    }
  }

  return result;
}

/**
 * Check if origin is allowed for client
 */
function isOriginAllowed(origin: string, clientConfig: IClientConfig): boolean {
  if (!origin || !clientConfig.allowedOrigins) {
    return false;
  }
  
  return clientConfig.allowedOrigins.some(allowedOrigin => {
    if (allowedOrigin === '*') {
      return false; // Wildcards not allowed for security
    }
    
    // Exact match
    if (allowedOrigin === origin) {
      return true;
    }
    
    // Check if it's a subdomain match (basic implementation)
    try {
      const originUrl = new URL(origin);
      const allowedUrl = new URL(allowedOrigin);
      
      return originUrl.hostname.endsWith(allowedUrl.hostname) &&
             originUrl.protocol === allowedUrl.protocol;
    } catch {
      return false;
    }
  });
}

/**
 * Validate API key and get client configuration
 * 
 * @param request - Authentication validation request
 * @param options - Validation options
 * @returns Validation result
 */
export async function validateApiKey(
  request: IAuthValidationRequest,
  options: IAuthValidationOptions = {}
): Promise<IAuthValidationResult> {
  const startTime = performance.now();

  try {
    const {
      checkOrigin = true,
      includeClientConfig = true,
      strictValidation = false
    } = options;

    // Validate input
    const { apiKey, origin, errors } = validateAuthInput(request);
    
    if (errors.length > 0) {
      return {
        success: false,
        error: {
          message: errors.join(', '),
          code: 'VALIDATION_ERROR',
          status: 400
        }
      };
    }

    // Get configurations
    const validApiKeys = getValidApiKeys();
    const clientConfigs = getClientConfigs();

    // Validate API key
    if (!validApiKeys.has(apiKey!)) {
      return {
        success: false,
        error: {
          message: 'Invalid API key',
          code: 'INVALID_API_KEY',
          status: 401
        }
      };
    }

    // Get client configuration
    const clientConfig = clientConfigs[apiKey!];
    if (!clientConfig) {
      return {
        success: false,
        error: {
          message: 'Client configuration not found',
          code: 'CONFIG_NOT_FOUND',
          status: 404
        }
      };
    }

    // Validate origin if provided and checking is enabled
    if (checkOrigin && origin && !isOriginAllowed(origin, clientConfig)) {
      return {
        success: false,
        error: {
          message: 'Origin not allowed',
          code: 'ORIGIN_NOT_ALLOWED',
          status: 403
        }
      };
    }

    const endTime = performance.now();
    const responseTime = Math.round((endTime - startTime) * 100) / 100;

    console.log(`✅ [AuthValidator] API key validation successful (${responseTime}ms):`, {
      apiKey: apiKey?.substring(0, 8) + '...',
      client: clientConfig.name,
      origin: origin || 'none'
    });

    return {
      success: true,
      data: {
        valid: true,
        client: includeClientConfig ? clientConfig : undefined,
        timestamp: new Date().toISOString(),
        apiKey: strictValidation ? undefined : apiKey
      }
    };

  } catch (error) {
    const endTime = performance.now();
    const responseTime = Math.round((endTime - startTime) * 100) / 100;
    
    console.error(`❌ [AuthValidator] Validation failed (${responseTime}ms):`, error);
    
    return {
      success: false,
      error: {
        message: 'Authentication validation failed',
        code: 'INTERNAL_ERROR',
        status: 500
      }
    };
  }
}

/**
 * Quick API key validation for simple use cases
 * 
 * @param apiKey - API key to validate
 * @returns True if valid, false otherwise
 */
export async function quickValidateApiKey(apiKey: string): Promise<boolean> {
  try {
    const result = await validateApiKey({ apiKey }, {
      checkOrigin: false,
      includeClientConfig: false,
      strictValidation: false
    });
    
    return result.success && result.data?.valid === true;
  } catch (error) {
    console.error('❌ [quickValidateApiKey] Failed:', error);
    return false;
  }
}

/**
 * Get client configuration by API key
 * 
 * @param apiKey - API key
 * @returns Client configuration or null
 */
export function getClientConfigByApiKey(apiKey: string): IClientConfig | null {
  try {
    const clientConfigs = getClientConfigs();
    return clientConfigs[apiKey] || null;
  } catch (error) {
    console.error('❌ [getClientConfigByApiKey] Failed:', error);
    return null;
  }
}

/**
 * Check if API key is valid (synchronous version)
 * 
 * @param apiKey - API key to check
 * @returns True if valid, false otherwise
 */
export function isValidApiKey(apiKey: string): boolean {
  try {
    const validApiKeys = getValidApiKeys();
    return validApiKeys.has(apiKey);
  } catch (error) {
    console.error('❌ [isValidApiKey] Failed:', error);
    return false;
  }
}
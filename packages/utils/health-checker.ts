/**
 * Health Check Utilities
 * 
 * @description
 * Reusable functions for health checking and system monitoring.
 * Can be used in APIs, background jobs, or direct function calls.
 * 
 * @features
 * - System health monitoring
 * - Memory usage tracking  
 * - Service connectivity checks
 * - Performance metrics
 * 
 * @author CSR Agent Team
 * @since 1.0.0
 */

export interface IHealthCheckOptions {
  includeMemory?: boolean;
  includeUptime?: boolean;
  includeEnvironment?: boolean;
  includeVersion?: boolean;
  includeTimestamp?: boolean;
  customChecks?: Array<() => Promise<boolean>>;
}

export interface IHealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  service: string;
  version?: string;
  uptime?: number;
  memory?: {
    used: number;
    total: number;
    free: number;
    usagePercent: number;
  };
  environment?: string;
  checks?: {
    [key: string]: boolean;
  };
  responseTime?: number;
}

export interface IHealthCheckResult {
  success: boolean;
  data?: IHealthStatus;
  error?: {
    message: string;
    details: string;
  };
}

/**
 * Get memory usage information
 */
function getMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    // Node.js environment
    const usage = process.memoryUsage();
    return {
      used: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100, // MB
      total: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100, // MB
      free: Math.round((usage.heapTotal - usage.heapUsed) / 1024 / 1024 * 100) / 100, // MB
      usagePercent: Math.round((usage.heapUsed / usage.heapTotal) * 100)
    };
  } else if (typeof performance !== 'undefined' && (performance as any).memory) {
    // Browser environment with performance.memory
    const memory = (performance as any).memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100, // MB
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024 * 100) / 100, // MB
      free: Math.round((memory.totalJSHeapSize - memory.usedJSHeapSize) / 1024 / 1024 * 100) / 100, // MB
      usagePercent: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100)
    };
  } else {
    // Fallback for environments without memory info
    return {
      used: 0,
      total: 0,
      free: 0,
      usagePercent: 0
    };
  }
}

/**
 * Get system uptime
 */
function getUptime(): number {
  if (typeof process !== 'undefined' && process.uptime) {
    return Math.round(process.uptime());
  } else if (typeof performance !== 'undefined' && performance.now) {
    // Browser fallback - time since page load
    return Math.round(performance.now() / 1000);
  } else {
    return 0;
  }
}

/**
 * Get environment information
 */
function getEnvironment(): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV || 'unknown';
  } else {
    return 'browser';
  }
}

/**
 * Get version information
 */
function getVersion(): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.npm_package_version || process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';
  } else {
    return '0.1.0';
  }
}

/**
 * Perform health check with configurable options
 * 
 * @param serviceName - Name of the service being checked
 * @param options - Health check configuration options
 * @returns Health check result
 */
export async function performHealthCheck(
  serviceName: string = 'ashi-widget',
  options: IHealthCheckOptions = {}
): Promise<IHealthCheckResult> {
  const startTime = performance.now();

  try {
    const {
      includeMemory = true,
      includeUptime = true,
      includeEnvironment = true,
      includeVersion = true,
      includeTimestamp = true,
      customChecks = []
    } = options;

    // Build health status
    const healthStatus: IHealthStatus = {
      status: 'healthy' as const,
      service: serviceName,
      timestamp: includeTimestamp ? new Date().toISOString() : '',
    };

    // Add optional fields
    if (includeVersion) {
      healthStatus.version = getVersion();
    }

    if (includeUptime) {
      healthStatus.uptime = getUptime();
    }

    if (includeMemory) {
      healthStatus.memory = getMemoryUsage();
    }

    if (includeEnvironment) {
      healthStatus.environment = getEnvironment();
    }

    // Run custom health checks
    if (customChecks.length > 0) {
      healthStatus.checks = {};
      let allChecksPass = true;

      for (let i = 0; i < customChecks.length; i++) {
        try {
          const checkResult = await customChecks[i]();
          healthStatus.checks[`check_${i + 1}`] = checkResult;
          if (!checkResult) {
            allChecksPass = false;
          }
        } catch (error) {
          healthStatus.checks[`check_${i + 1}`] = false;
          allChecksPass = false;
        }
      }

      // Update status based on custom checks
      if (!allChecksPass) {
        healthStatus.status = 'degraded';
      }
    }

    const endTime = performance.now();
    healthStatus.responseTime = Math.round((endTime - startTime) * 100) / 100;

    console.log(`✅ [HealthCheck] ${serviceName} health check completed successfully (${healthStatus.responseTime}ms)`);

    return {
      success: true,
      data: healthStatus
    };

  } catch (error) {
    const endTime = performance.now();
    const responseTime = Math.round((endTime - startTime) * 100) / 100;
    
    console.error(`❌ [HealthCheck] ${serviceName} health check failed (${responseTime}ms):`, error);
    
    return {
      success: false,
      error: {
        message: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * Quick health check for simple use cases
 * 
 * @param serviceName - Name of the service
 * @returns Simple health status or null if failed
 */
export async function quickHealthCheck(serviceName: string = 'ashi-widget'): Promise<IHealthStatus | null> {
  try {
    const result = await performHealthCheck(serviceName, {
      includeMemory: true,
      includeUptime: true,
      includeEnvironment: true,
      includeVersion: true,
      includeTimestamp: true
    });
    
    return result.success ? result.data || null : null;
  } catch (error) {
    console.error('❌ [quickHealthCheck] Failed:', error);
    return null;
  }
}

/**
 * Basic connectivity health check
 * Tests if the service is responding
 */
export function basicHealthCheck(): IHealthStatus {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ashi-widget',
    version: getVersion(),
    uptime: getUptime(),
    memory: getMemoryUsage(),
    environment: getEnvironment(),
    responseTime: 0
  };
}

/**
 * Health check with external service connectivity
 * 
 * @param externalServices - Array of service URLs to check
 * @returns Health status with connectivity results
 */
export async function healthCheckWithConnectivity(
  externalServices: string[] = []
): Promise<IHealthCheckResult> {
  const customChecks = externalServices.map(serviceUrl => 
    async (): Promise<boolean> => {
      try {
        const response = await fetch(serviceUrl, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        return response.ok;
      } catch (error) {
        console.warn(`⚠️ [HealthCheck] External service check failed for ${serviceUrl}:`, error);
        return false;
      }
    }
  );

  return performHealthCheck('ashi-widget', {
    includeMemory: true,
    includeUptime: true,
    includeEnvironment: true,
    includeVersion: true,
    includeTimestamp: true,
    customChecks
  });
}

/**
 * Format health status for logging
 */
export function formatHealthStatus(health: IHealthStatus): string {
  const parts = [
    `Status: ${health.status}`,
    `Service: ${health.service}`,
    health.version ? `Version: ${health.version}` : null,
    health.uptime ? `Uptime: ${health.uptime}s` : null,
    health.memory ? `Memory: ${health.memory.used}MB/${health.memory.total}MB (${health.memory.usagePercent}%)` : null,
    health.environment ? `Env: ${health.environment}` : null,
    health.responseTime ? `Response: ${health.responseTime}ms` : null
  ].filter(Boolean);

  return parts.join(', ');
}
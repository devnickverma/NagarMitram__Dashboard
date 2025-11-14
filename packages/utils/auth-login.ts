/**
 * Authentication Login Utilities
 * 
 * @description
 * Reusable functions for user login and authentication.
 * Replaces the /api/authentication/login endpoint with function-based approach.
 * 
 * @features
 * - User credential validation
 * - Token generation
 * - Multi-user support
 * - Session management
 * 
 * @author CSR Agent Team
 * @since 1.0.0
 */

export interface ILoginCredentials {
  jewelerid: string;
  userName: string;
  password: string;
}

export interface ILoginResponse {
  success: boolean;
  token?: string;
  user?: {
    jewelerid: string;
    userName: string;
    firstName?: string;
    lastName?: string;
    role: string;
    email?: string;
    phone?: string;
  };
  expiresIn?: string;
  sessionId?: string;
}

export interface ILoginResult {
  success: boolean;
  data?: ILoginResponse;
  error?: {
    message: string;
    code: string;
    status: number;
  };
}

/**
 * Valid user credentials (in production, this would come from a database)
 */
const VALID_USERS = [
  {
    jewelerid: 'CARTJA11720',
    userName: 'salesassociate@test.com',
    password: '123456789',
    role: 'Sales Associate',
    firstName: 'John',
    lastName: 'Sales',
    email: 'salesassociate@test.com',
    phone: '+1-555-0101'
  },
  {
    jewelerid: 'CARTJA11720',
    userName: 'demopm@test.com',
    password: '123456789',
    role: 'Purchasing Manager',
    firstName: 'Jane',
    lastName: 'Purchase',
    email: 'demopm@test.com',
    phone: '+1-555-0102'
  },
  {
    jewelerid: 'CARTJA11720',
    userName: 'demoam@test.com',
    password: '123456789',
    role: 'Accounting Manager',
    firstName: 'Bob',
    lastName: 'Account',
    email: 'demoam@test.com',
    phone: '+1-555-0103'
  },
  {
    jewelerid: 'CARTJA11720',
    userName: 'demomm@test.com',
    password: '123456789',
    role: 'Marketing Manager',
    firstName: 'Alice',
    lastName: 'Marketing',
    email: 'demomm@test.com',
    phone: '+1-555-0104'
  }
];

/**
 * Validate login credentials
 */
function validateLoginCredentials(credentials: any): { 
  jewelerid?: string; 
  userName?: string; 
  password?: string; 
  errors: string[] 
} {
  const errors: string[] = [];
  const result: { jewelerid?: string; userName?: string; password?: string; errors: string[] } = { errors };

  // Validate jewelerid
  if (!credentials.jewelerid) {
    errors.push('Jeweler ID is required');
  } else if (typeof credentials.jewelerid !== 'string') {
    errors.push('Jeweler ID must be a string');
  } else if (credentials.jewelerid.length < 3 || credentials.jewelerid.length > 50) {
    errors.push('Jeweler ID must be between 3 and 50 characters');
  } else {
    result.jewelerid = credentials.jewelerid.trim();
  }

  // Validate userName
  if (!credentials.userName) {
    errors.push('Username is required');
  } else if (typeof credentials.userName !== 'string') {
    errors.push('Username must be a string');
  } else if (credentials.userName.length < 3 || credentials.userName.length > 100) {
    errors.push('Username must be between 3 and 100 characters');
  } else {
    result.userName = credentials.userName.trim();
  }

  // Validate password
  if (!credentials.password) {
    errors.push('Password is required');
  } else if (typeof credentials.password !== 'string') {
    errors.push('Password must be a string');
  } else if (credentials.password.length < 6 || credentials.password.length > 100) {
    errors.push('Password must be between 6 and 100 characters');
  } else {
    result.password = credentials.password; // Don't trim passwords
  }

  return result;
}

/**
 * Generate a simple token (in production, use proper JWT library)
 */
function generateToken(user: any): string {
  const tokenData = {
    jewelerid: user.jewelerid,
    userName: user.userName,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  };

  return Buffer.from(JSON.stringify(tokenData)).toString('base64');
}

/**
 * Find user by credentials
 */
function findUserByCredentials(jewelerid: string, userName: string, password: string) {
  return VALID_USERS.find(user => 
    user.jewelerid === jewelerid &&
    user.userName === userName &&
    user.password === password
  );
}

/**
 * Authenticate user with credentials
 * 
 * @param credentials - User login credentials
 * @returns Authentication result
 */
export async function authenticateUser(credentials: ILoginCredentials): Promise<ILoginResult> {
  const startTime = performance.now();

  try {
    // Validate input
    const { jewelerid, userName, password, errors } = validateLoginCredentials(credentials);
    
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

    // Find matching user
    const user = findUserByCredentials(jewelerid!, userName!, password!);
    
    if (!user) {
      // Add small delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      
      return {
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
          status: 401
        }
      };
    }

    // Generate token
    const token = generateToken(user);
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    const endTime = performance.now();
    const responseTime = Math.round((endTime - startTime) * 100) / 100;

    console.log(`✅ [AuthLogin] User authenticated successfully (${responseTime}ms):`, {
      jewelerid: user.jewelerid,
      userName: user.userName,
      role: user.role
    });

    return {
      success: true,
      data: {
        success: true,
        token,
        user: {
          jewelerid: user.jewelerid,
          userName: user.userName,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          email: user.email,
          phone: user.phone
        },
        expiresIn: '24h',
        sessionId
      }
    };

  } catch (error) {
    const endTime = performance.now();
    const responseTime = Math.round((endTime - startTime) * 100) / 100;
    
    console.error(`❌ [AuthLogin] Authentication failed (${responseTime}ms):`, error);
    
    return {
      success: false,
      error: {
        message: 'Authentication failed',
        code: 'INTERNAL_ERROR',
        status: 500
      }
    };
  }
}

/**
 * Quick authentication for simple use cases
 * 
 * @param jewelerid - Jeweler ID
 * @param userName - Username/email
 * @param password - Password
 * @returns True if valid, false otherwise
 */
export async function quickAuthenticate(jewelerid: string, userName: string, password: string): Promise<boolean> {
  try {
    const result = await authenticateUser({ jewelerid, userName, password });
    return result.success;
  } catch (error) {
    console.error('❌ [quickAuthenticate] Failed:', error);
    return false;
  }
}

/**
 * Validate token and extract user info
 * 
 * @param token - JWT-like token
 * @returns User info or null if invalid
 */
export function validateToken(token: string): any | null {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Check expiration
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    // Verify user still exists
    const user = VALID_USERS.find(u => 
      u.jewelerid === decoded.jewelerid && 
      u.userName === decoded.userName
    );

    if (!user) {
      return null;
    }

    return {
      jewelerid: decoded.jewelerid,
      userName: decoded.userName,
      role: decoded.role,
      sessionId: decoded.sessionId,
      issuedAt: decoded.iat,
      expiresAt: decoded.exp
    };

  } catch (error) {
    console.error('❌ [validateToken] Failed:', error);
    return null;
  }
}

/**
 * Get all available users (for demo purposes)
 * 
 * @returns Array of user info (without passwords)
 */
export function getAvailableUsers() {
  return VALID_USERS.map(user => ({
    jewelerid: user.jewelerid,
    userName: user.userName,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone
  }));
}

/**
 * Check if user exists by username
 * 
 * @param userName - Username to check
 * @returns True if user exists, false otherwise
 */
export function userExists(userName: string): boolean {
  return VALID_USERS.some(user => user.userName === userName);
}

/**
 * Get user by username (without password)
 * 
 * @param userName - Username
 * @returns User info or null
 */
export function getUserByUsername(userName: string) {
  const user = VALID_USERS.find(u => u.userName === userName);
  if (!user) return null;

  return {
    jewelerid: user.jewelerid,
    userName: user.userName,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone
  };
}
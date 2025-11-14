/**
 * Complete Authentication Flow Usage Examples
 * 
 * This file demonstrates how to use the complete authentication flow that handles:
 * Login → Create User → Create Session → Store All Data
 */

import {
  completeAuthenticationFlow,
  authenticateUser,
  getCompleteAuthData,
  getCurrentAuthData,
  isUserAuthenticated,
  getCurrentHostAuthToken,
  getCurrentUserId,
  getCurrentSessionId,
  getAuthenticationState,
  clearAuthenticationData,
  authFlowAPI
} from './auth-flow';

import { ILoginFormData } from './types';

/**
 * Example 1: Complete authentication flow with form data
 */
export async function completeAuthFlowExample() {
  console.log('🔐 Running complete authentication flow example...');

  const loginData: ILoginFormData = {
    jewelerid: "JEWELER123",
    userName: "john.doe@example.com",
    password: "securePassword123"
  };

  try {
    const result = await completeAuthenticationFlow(loginData);

    if (result.success) {
      console.log('✅ Complete authentication flow successful!');
      console.log('📊 Flow Summary:', {
        step: result.step,
        jewelerid: result.data?.complete_auth_data?.jewelerid,
        user_id: result.data?.user_id,
        session_id: result.data?.session_id,
        freshchat_user_id: result.data?.freshchat_user_id,
        has_host_token: !!result.data?.host_tokens?.host_auth_token
      });

      // Access the complete auth data
      if (result.data?.complete_auth_data) {
        const authData = result.data.complete_auth_data;
        console.log('🔑 Authentication Details:', {
          isAuthenticated: authData.isAuthenticated,
          login_count: authData.login_count,
          flow_version: authData.flow_version,
          host_auth_token: authData.host_auth_token ? '***HIDDEN***' : 'none'
        });
      }

      return result;
    } else {
      console.error('❌ Authentication flow failed:', result.message);
      console.error('   Step failed:', result.step);
      console.error('   Error details:', result.error_details);
      return null;
    }
  } catch (error) {
    console.error('❌ Authentication flow error:', error);
    return null;
  }
}

/**
 * Example 2: Simplified authentication
 */
export async function simplifiedAuthExample() {
  console.log('🚀 Running simplified authentication example...');

  try {
    const result = await authenticateUser(
      "JEWELER456",
      "jane.smith@example.com",
      "myPassword456"
    );

    if (result.success) {
      console.log('✅ Simplified authentication successful!');
      console.log('📋 Quick Access:', {
        user_id: result.data?.user_id,
        session_id: result.data?.session_id,
        step_completed: result.step
      });

      return result;
    } else {
      console.error('❌ Simplified authentication failed:', result.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Simplified authentication error:', error);
    return null;
  }
}

/**
 * Example 3: Check authentication status and retrieve stored data
 */
export async function checkAuthStatusExample() {
  console.log('📊 Checking authentication status...');

  try {
    // Check if any user is currently authenticated
    const isAuthenticated = isUserAuthenticated();
    console.log(`🔒 Current authentication status: ${isAuthenticated}`);

    if (isAuthenticated) {
      // Get current auth data
      const currentAuth = getCurrentAuthData();
      if (currentAuth) {
        console.log('👤 Current User:', {
          jewelerid: currentAuth.jewelerid,
          userName: currentAuth.userName,
          user_id: currentAuth.user_id,
          session_id: currentAuth.session_id,
          login_count: currentAuth.login_count,
          last_login: currentAuth.login_timestamp
        });

        // Get quick access data
        const hostToken = getCurrentHostAuthToken();
        const userId = getCurrentUserId();
        const sessionId = getCurrentSessionId();

        console.log('🔑 Quick Access Data:', {
          host_token: hostToken ? '***AVAILABLE***' : 'none',
          user_id: userId,
          session_id: sessionId
        });

        // Get UI authentication state
        const authState = getAuthenticationState();
        console.log('🖥️ UI Auth State:', authState);

        return {
          isAuthenticated,
          currentAuth,
          hostToken,
          userId,
          sessionId,
          authState
        };
      }
    } else {
      console.log('❌ No user currently authenticated');
      return null;
    }
  } catch (error) {
    console.error('❌ Error checking auth status:', error);
    return null;
  }
}

/**
 * Example 4: Class-based authentication flow
 */
export async function classBasedAuthExample() {
  console.log('🏗️ Using class-based authentication flow...');

  const loginData: ILoginFormData = {
    jewelerid: "JEWELER789",
    userName: "admin@company.com",
    password: "adminPass789"
  };

  try {
    // Using the class instance directly
    const result = await authFlowAPI.completeAuthenticationFlow(loginData);

    if (result.success) {
      console.log('✅ Class-based authentication successful!');
      console.log('📈 Advanced Flow Data:', {
        step: result.step,
        has_login_response: !!result.data?.login_response,
        has_host_tokens: !!result.data?.host_tokens,
        has_complete_auth_data: !!result.data?.complete_auth_data
      });

      return result;
    } else {
      console.error('❌ Class-based authentication failed:', result.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Class-based authentication error:', error);
    return null;
  }
}

/**
 * Example 5: Handle authentication for LoginModal component
 */
export async function handleLoginModalSubmit(formData: ILoginFormData) {
  console.log('📝 Handling login modal submission...', {
    jewelerid: formData.jewelerid,
    userName: formData.userName
  });

  try {
    // This is what you would call from your LoginModal component
    const result = await completeAuthenticationFlow(formData);

    if (result.success) {
      console.log('✅ Login modal authentication successful!');
      
      // Return data that the UI component needs
      return {
        success: true,
        message: 'Authentication successful!',
        authData: result.data?.complete_auth_data,
        userReady: true,
        canStartChat: true,
        hostTokenExtracted: !!result.data?.host_tokens?.host_auth_token
      };
    } else {
      console.error('❌ Login modal authentication failed:', result.message);
      
      // Return error data for the UI
      return {
        success: false,
        message: result.message,
        error: result.error_details,
        step: result.step,
        canRetry: result.step !== 'login' // Can retry if not a login failure
      };
    }
  } catch (error) {
    console.error('❌ Login modal error:', error);
    return {
      success: false,
      message: 'Internal authentication error',
      error: error instanceof Error ? error.message : 'Unknown error',
      canRetry: true
    };
  }
}

/**
 * Example 6: Authentication state management for React components
 */
export function useAuthenticationData(jewelerid?: string) {
  // This would be used in a React hook
  const authData = jewelerid ? 
    getCompleteAuthData(jewelerid) : 
    getCurrentAuthData();

  const isAuthenticated = isUserAuthenticated(jewelerid);
  const authState = getAuthenticationState(jewelerid);

  return {
    // Authentication status
    isAuthenticated,
    authState,
    
    // User data
    jewelerid: authData?.jewelerid,
    userName: authData?.userName,
    userId: authData?.user_id,
    freshchatUserId: authData?.freshchat_user_id,
    
    // Session data
    sessionId: authData?.session_id,
    authToken: authData?.auth_token,
    hostAuthToken: authData?.host_auth_token,
    
    // Metadata
    loginCount: authData?.login_count,
    lastLogin: authData?.login_timestamp,
    
    // Quick access functions
    getCurrentHostToken: getCurrentHostAuthToken,
    getCurrentUserId: getCurrentUserId,
    getCurrentSessionId: getCurrentSessionId,
    
    // Management functions
    clearAuth: () => clearAuthenticationData(jewelerid),
    refreshAuth: () => getCurrentAuthData()
  };
}

/**
 * Example 7: Authentication flow with custom API base URL
 */
export async function authWithCustomAPIExample() {
  console.log('🌐 Authentication with custom API base URL...');

  const loginData: ILoginFormData = {
    jewelerid: "CUSTOM_JEWELER",
    userName: "custom@example.com",
    password: "customPass123"
  };

  const customAPIBaseURL = "https://api.custom-domain.com";

  try {
    const result = await completeAuthenticationFlow(loginData, customAPIBaseURL);

    if (result.success) {
      console.log('✅ Custom API authentication successful!');
      console.log('🌍 Used custom API:', customAPIBaseURL);
      return result;
    } else {
      console.error('❌ Custom API authentication failed:', result.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Custom API authentication error:', error);
    return null;
  }
}

/**
 * Example 8: Clear authentication data
 */
export async function clearAuthDataExample() {
  console.log('🗑️ Clearing authentication data...');

  try {
    // Get current auth data before clearing
    const currentAuth = getCurrentAuthData();
    if (currentAuth) {
      console.log('📋 Current auth data:', {
        jewelerid: currentAuth.jewelerid,
        userName: currentAuth.userName,
        login_count: currentAuth.login_count
      });

      // Clear current authentication
      const cleared = clearAuthenticationData();
      if (cleared) {
        console.log('✅ Authentication data cleared successfully');
        
        // Verify it's cleared
        const afterClear = getCurrentAuthData();
        console.log('🔍 After clear check:', afterClear ? 'Still exists' : 'Cleared');
        
        return true;
      } else {
        console.error('❌ Failed to clear authentication data');
        return false;
      }
    } else {
      console.log('ℹ️ No authentication data to clear');
      return true;
    }
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
    return false;
  }
}

/**
 * Example 9: Complete workflow - Login, Chat, Logout
 */
export async function completeWorkflowExample() {
  console.log('🔄 Running complete workflow example...');

  const loginData: ILoginFormData = {
    jewelerid: "WORKFLOW_TEST",
    userName: "workflow@example.com",
    password: "workflowPass123"
  };

  try {
    // Step 1: Authenticate
    console.log('Step 1: Authenticating...');
    const authResult = await completeAuthenticationFlow(loginData);
    
    if (!authResult.success) {
      console.error('❌ Workflow failed at authentication:', authResult.message);
      return null;
    }

    console.log('✅ Authentication complete');

    // Step 2: Verify we can access auth data
    console.log('Step 2: Verifying auth data access...');
    const authData = getCurrentAuthData();
    if (!authData) {
      console.error('❌ Could not access auth data after login');
      return null;
    }

    console.log('✅ Auth data accessible:', {
      user_id: authData.user_id,
      session_id: authData.session_id,
      has_tokens: !!authData.host_auth_token
    });

    // Step 3: Simulate chat readiness check
    console.log('Step 3: Chat readiness check...');
    const isReady = isUserAuthenticated() && 
                   getCurrentUserId() && 
                   getCurrentSessionId() && 
                   getCurrentHostAuthToken();
    
    if (isReady) {
      console.log('✅ Ready for chat!');
      console.log('💬 Chat parameters available:', {
        user_id: getCurrentUserId(),
        session_id: getCurrentSessionId(),
        auth_token: getCurrentHostAuthToken() ? '***AVAILABLE***' : 'missing'
      });
    } else {
      console.error('❌ Not ready for chat - missing required data');
    }

    // Step 4: Cleanup (optional)
    console.log('Step 4: Cleanup (logout)...');
    const cleared = clearAuthenticationData();
    console.log(`🧹 Cleanup ${cleared ? 'successful' : 'failed'}`);

    return {
      authResult,
      authData,
      isReady,
      cleared
    };

  } catch (error) {
    console.error('❌ Complete workflow error:', error);
    return null;
  }
}

/**
 * Run all authentication flow examples
 */
export async function runAllAuthFlowExamples() {
  console.log('='.repeat(60));
  console.log('🔐 Running Complete Authentication Flow Examples');
  console.log('='.repeat(60));

  await completeAuthFlowExample();
  console.log('-'.repeat(40));

  await simplifiedAuthExample();
  console.log('-'.repeat(40));

  await checkAuthStatusExample();
  console.log('-'.repeat(40));

  await classBasedAuthExample();
  console.log('-'.repeat(40));

  await authWithCustomAPIExample();
  console.log('-'.repeat(40));

  await clearAuthDataExample();
  console.log('-'.repeat(40));

  await completeWorkflowExample();

  console.log('='.repeat(60));
  console.log('✅ All authentication flow examples completed');
  console.log('='.repeat(60));
}

// Export for potential use in testing or development
export default {
  completeAuthFlowExample,
  simplifiedAuthExample,
  checkAuthStatusExample,
  classBasedAuthExample,
  handleLoginModalSubmit,
  useAuthenticationData,
  authWithCustomAPIExample,
  clearAuthDataExample,
  completeWorkflowExample,
  runAllAuthFlowExamples
};
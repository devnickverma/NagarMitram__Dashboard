/**
 * Test Authentication Flow - Direct createUser API call
 * This is a simplified test to verify the createUser API is working
 */

import { createInternalUser } from './internal-user';
import { createSession } from './session';
import { ILoginFormData } from './types';

/**
 * Test function to manually trigger createUser API
 * This bypasses the login step and directly calls createUser API
 */
export async function testCreateUserAPI(loginData: ILoginFormData) {
  console.log('🧪 Testing createUser API directly...', {
    jewelerid: loginData.jewelerid,
    userName: loginData.userName
  });

  try {
    // Step 1: Use a test host_auth_token (you can replace this with a real one)
    const testHostAuthToken = 'test_host_token_123';

    console.log('Step 1: Using test host_auth_token:', testHostAuthToken);

    // Step 2: Call createUser API directly
    console.log('Step 2: Calling createUser API...', {
      endpoint: '/api/v1/user/create',
      data: {
        email: loginData.userName,
        first_name: loginData.userName.split('@')[0],
        last_name: '',
        phone: '',
        reference_id: `${loginData.jewelerid}_${Date.now()}`,
        org_id: loginData.jewelerid
      }
    });

    const userResponse = await createInternalUser(
      {
        email: loginData.userName,
        first_name: loginData.userName.split('@')[0],
        last_name: '',
        phone: '',
        reference_id: `${loginData.jewelerid}_${Date.now()}`,
        org_id: loginData.jewelerid
      },
      testHostAuthToken
    );

    console.log('📊 CreateUser API Response:', {
      success: userResponse.success,
      user_id: userResponse.user_id,
      freshchat_user_id: userResponse.freshchat_user_id,
      message: userResponse.message
    });

    if (userResponse.success) {
      console.log('✅ CreateUser API called successfully!');
      console.log('🆔 User created:', {
        user_id: userResponse.user_id,
        freshchat_user_id: userResponse.freshchat_user_id
      });

      // Step 3: Test session creation
      if (userResponse.user_id) {
        console.log('Step 3: Testing session creation...');
        
        const sessionResponse = await createSession({
          user_id: userResponse.user_id,
          auth_token: testHostAuthToken,
          metadata: {
            jewelerid: loginData.jewelerid,
            userName: loginData.userName,
            test_flow: true
          }
        });

        console.log('📊 Session API Response:', {
          success: sessionResponse.success,
          session_id: sessionResponse.session_id,
          message: sessionResponse.message
        });

        if (sessionResponse.success) {
          console.log('✅ Complete test flow successful!');
          return {
            success: true,
            user_id: userResponse.user_id,
            freshchat_user_id: userResponse.freshchat_user_id,
            session_id: sessionResponse.session_id,
            host_auth_token: testHostAuthToken
          };
        } else {
          console.error('❌ Session creation failed:', sessionResponse.message);
          return {
            success: false,
            step: 'session_creation',
            error: sessionResponse.message
          };
        }
      }
    } else {
      console.error('❌ CreateUser API failed:', userResponse.message);
      return {
        success: false,
        step: 'user_creation',
        error: userResponse.message,
        error_details: userResponse.error_details
      };
    }
  } catch (error) {
    console.error('❌ Test flow error:', error);
    return {
      success: false,
      step: 'test_error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test with real host_auth_token if you have one
 */
export async function testWithRealHostToken(
  loginData: ILoginFormData, 
  realHostAuthToken: string
) {
  console.log('🔐 Testing with real host_auth_token...');

  try {
    const userResponse = await createInternalUser(
      {
        email: loginData.userName,
        first_name: loginData.userName.split('@')[0],
        last_name: '',
        phone: '',
        reference_id: `${loginData.jewelerid}_${Date.now()}`,
        org_id: loginData.jewelerid
      },
      realHostAuthToken
    );

    console.log('📊 Real token test result:', {
      success: userResponse.success,
      user_id: userResponse.user_id,
      message: userResponse.message
    });

    return userResponse;
  } catch (error) {
    console.error('❌ Real token test error:', error);
    return {
      success: false,
      message: 'Error with real host token',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Quick test function you can call from browser console
 */
export async function quickCreateUserTest() {
  const testLoginData: ILoginFormData = {
    jewelerid: 'TEST_JEWELER',
    userName: 'test@example.com',
    password: 'testpass123'
  };

  console.log('🚀 Running quick createUser test...');
  const result = await testCreateUserAPI(testLoginData);
  
  console.log('🎯 Quick test result:', result);
  return result;
}

/**
 * Check what host tokens are available in browser
 */
export function checkAvailableTokens() {
  console.log('🔍 Checking available tokens in browser...');

  const tokens = {
    localStorage: {
      host_auth_token: localStorage.getItem('host_auth_token'),
      auth_token: localStorage.getItem('auth_token'),
      access_token: localStorage.getItem('access_token'),
      api_key: localStorage.getItem('api_key')
    },
    sessionStorage: {
      host_auth_token: sessionStorage.getItem('host_auth_token'),
      auth_token: sessionStorage.getItem('auth_token'),
      access_token: sessionStorage.getItem('access_token'),
      api_key: sessionStorage.getItem('api_key')
    },
    cookies: document.cookie
  };

  console.log('💾 Available tokens:', tokens);
  
  // Find any available token
  const availableToken = tokens.localStorage.host_auth_token ||
                        tokens.localStorage.auth_token ||
                        tokens.localStorage.access_token ||
                        tokens.sessionStorage.host_auth_token ||
                        tokens.sessionStorage.auth_token ||
                        tokens.sessionStorage.access_token;

  if (availableToken) {
    console.log('✅ Found available token:', availableToken.substring(0, 20) + '...');
    return availableToken;
  } else {
    console.log('❌ No tokens found in browser storage');
    return null;
  }
}

// Make functions available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testCreateUserAPI = testCreateUserAPI;
  (window as any).quickCreateUserTest = quickCreateUserTest;
  (window as any).checkAvailableTokens = checkAvailableTokens;
  (window as any).testWithRealHostToken = testWithRealHostToken;
}

export default {
  testCreateUserAPI,
  testWithRealHostToken,
  quickCreateUserTest,
  checkAvailableTokens
};
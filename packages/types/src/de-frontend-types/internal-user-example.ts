/**
 * Internal User API Usage Examples
 * 
 * This file demonstrates how to create users using the internal API
 * instead of direct Freshchat API calls, using host_auth_token for authentication.
 */

import { 
  createInternalUser,
  createInternalUserSimplified,
  getStoredInternalUser,
  getLastCreatedInternalUserId,
  getLastCreatedInternalFreshchatUserId,
  getFreshchatUserIdByUserId,
  getUserIdsByReferenceId,
  getAllStoredInternalUsers,
  isInternalUserStoredLocally,
  getHostAuthToken,
  internalUserAPI,
  IInternalUserRequest 
} from './internal-user';

/**
 * Example 1: Create user with the internal API (replacing Freshchat direct creation)
 */
export async function createInternalUserExample() {
  console.log('👤 Creating user with internal API...');
  
  // Get host auth token from storage
  const hostAuthToken = getHostAuthToken();
  
  if (!hostAuthToken) {
    console.error('❌ No host_auth_token found. Please ensure it\'s stored in localStorage/sessionStorage');
    return null;
  }

  const userRequest: IInternalUserRequest = {
    user_email: "johndoe@mail.com",
    org_id: "CARTJA11720", // This would be the jeweler_id from the original request
    user_name: "john.doe",
    first_name: "John",
    last_name: "Doe",
    phone: "235689713",
    reference_id: "john@doe"
  };

  try {
    const result = await createInternalUser(
      userRequest,
      hostAuthToken
      // apiBaseURL is optional - will auto-detect from current location
    );
    
    if (result.success) {
      console.log('✅ User created successfully via internal API:', {
        user_id: result.user_id,
        freshchat_user_id: result.freshchat_user_id,
        message: result.message
      });
      
      console.log('📊 Full response data:', result.user_data);
      
      return {
        user_id: result.user_id,
        freshchat_user_id: result.freshchat_user_id
      };
    } else {
      console.error('❌ Failed to create user via internal API:', result.message);
      console.error('Error details:', result.error_details);
      return null;
    }
  } catch (error) {
    console.error('❌ Exception while creating internal user:', error);
    return null;
  }
}

/**
 * Example 2: Create user with simplified method
 */
export async function createUserSimplifiedExample() {
  console.log('👤 Creating user with simplified method...');
  
  const hostAuthToken = getHostAuthToken();
  
  if (!hostAuthToken) {
    console.error('❌ No host_auth_token found');
    return null;
  }

  try {
    const result = await createInternalUserSimplified(
      "jane.smith@example.com", // email
      "Jane",                    // firstName
      "Smith",                   // lastName
      "555-0123",               // phone
      "jane@smith",             // referenceId
      "JEWELR12345",            // orgId (jeweler_id)
      hostAuthToken
    );
    
    if (result.success) {
      console.log('✅ User created successfully via simplified method:', {
        user_id: result.user_id,
        generated_username: result.user_data?.user_name || 'jane.smith'
      });
      return result.user_id;
    } else {
      console.error('❌ Simplified creation failed:', result.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Exception in simplified creation:', error);
    return null;
  }
}

/**
 * Example 3: Convert from legacy Freshchat format and create user
 */
export async function createUserFromLegacyFormat() {
  console.log('🔄 Converting from legacy Freshchat format and creating user...');
  
  const hostAuthToken = getHostAuthToken();
  
  if (!hostAuthToken) {
    console.error('❌ No host_auth_token found');
    return null;
  }

  // Legacy Freshchat format (original request structure)
  const legacyRequest = {
    email: "legacy@example.com",
    first_name: "Legacy",
    last_name: "User",
    phone: "555-9999",
    reference_id: "legacy@user",
    jeweler_id: "LEGACY123"
  };

  try {
    // Convert to internal API format
    const internalRequest = internalUserAPI.convertFromFreshchatRequest(legacyRequest);
    
    console.log('🔄 Converted request:', internalRequest);
    
    const result = await createInternalUser(
      internalRequest,
      hostAuthToken
    );
    
    if (result.success) {
      console.log('✅ Legacy user converted and created successfully:', {
        user_id: result.user_id,
        original_jeweler_id: legacyRequest.jeweler_id,
        new_org_id: internalRequest.org_id
      });
      return result.user_id;
    } else {
      console.error('❌ Legacy conversion failed:', result.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Exception in legacy conversion:', error);
    return null;
  }
}

/**
 * Example 4: Check localStorage functionality with dual ID storage
 */
export async function testLocalStorageFunctionality() {
  console.log('📦 Testing localStorage functionality with dual ID storage...');
  
  // Check if we have any stored users
  const allUsers = getAllStoredInternalUsers();
  console.log(`📊 Found ${allUsers.length} stored internal users`);
  
  // Get the last created user IDs
  const lastUserId = getLastCreatedInternalUserId();
  const lastFreshchatUserId = getLastCreatedInternalFreshchatUserId();
  console.log(`🆔 Last created user ID: ${lastUserId || 'None'}`);
  console.log(`💬 Last created Freshchat user ID: ${lastFreshchatUserId || 'None'}`);
  
  // Check if a specific user is stored
  const isStored = isInternalUserStoredLocally("john@doe");
  console.log(`📍 User 'john@doe' stored locally: ${isStored}`);
  
  if (isStored) {
    const storedUser = getStoredInternalUser("john@doe");
    console.log('📄 Stored user data:', {
      user_id: storedUser?.user_id,
      freshchat_user_id: storedUser?.freshchat_user_id,
      reference_id: storedUser?.reference_id,
      user_email: storedUser?.user_email,
      created_at: storedUser?.created_at
    });
    
    // Test ID retrieval functions
    const userIds = getUserIdsByReferenceId("john@doe");
    console.log('🔗 User IDs by reference:', userIds);
    
    if (userIds.user_id) {
      const freshchatId = getFreshchatUserIdByUserId(userIds.user_id);
      console.log(`🔍 Freshchat ID lookup for user ${userIds.user_id}: ${freshchatId}`);
    }
  }
  
  return {
    totalUsers: allUsers.length,
    lastUserId,
    lastFreshchatUserId,
    johnDoeStored: isStored
  };
}

/**
 * Example 5: Test with different API base URLs
 */
export async function testWithCustomAPIBaseURL() {
  console.log('🌐 Testing with custom API base URL...');
  
  const hostAuthToken = getHostAuthToken();
  
  if (!hostAuthToken) {
    console.error('❌ No host_auth_token found');
    return null;
  }

  const userRequest: IInternalUserRequest = {
    user_email: "custom@example.com",
    org_id: "CUSTOM123",
    user_name: "custom.user",
    first_name: "Custom",
    last_name: "User",
    phone: "555-1234",
    reference_id: "custom@user"
  };

  try {
    // Test with explicit API base URL
    const customAPIBase = "https://your-api-domain.com"; // Replace with actual API base
    
    const result = await createInternalUser(
      userRequest,
      hostAuthToken,
      customAPIBase // Explicit API base URL
    );
    
    if (result.success) {
      console.log('✅ User created with custom API base URL:', result.user_id);
      return result.user_id;
    } else {
      console.log('ℹ️ Custom API base test (expected if API not available):', result.message);
      return null;
    }
  } catch (error) {
    console.log('ℹ️ Custom API base test error (expected):', error);
    return null;
  }
}

/**
 * Example 6: Error handling and validation
 */
export async function testErrorHandling() {
  console.log('🧪 Testing error handling...');
  
  // Test with missing required fields
  const incompleteRequest = {
    user_email: "incomplete@example.com",
    first_name: "Incomplete"
    // Missing required fields
  } as IInternalUserRequest;

  const result = await createInternalUser(
    incompleteRequest,
    "fake-token"
  );
  
  if (!result.success) {
    console.log('✅ Error handling working correctly:', result.message);
    console.log('Error details:', result.error_details);
  }

  // Test with missing host_auth_token
  const validRequest: IInternalUserRequest = {
    user_email: "test@example.com",
    org_id: "TEST123",
    user_name: "test.user",
    first_name: "Test",
    last_name: "User",
    phone: "555-0000",
    reference_id: "test@user"
  };

  const result2 = await createInternalUser(validRequest, "");
  
  if (!result2.success) {
    console.log('✅ Token validation working correctly:', result2.message);
  }
}

/**
 * Example 7: Using class-based API
 */
export async function testClassBasedAPI() {
  console.log('🏗️ Testing class-based API...');
  
  const hostAuthToken = getHostAuthToken();
  
  if (!hostAuthToken) {
    console.error('❌ No host_auth_token found');
    return null;
  }

  const userRequest: IInternalUserRequest = {
    user_email: "class@example.com",
    org_id: "CLASS123",
    user_name: "class.user",
    first_name: "Class",
    last_name: "User",
    phone: "555-5555",
    reference_id: "class@user"
  };

  try {
    // Using the class instance directly
    const result = await internalUserAPI.createUser(
      userRequest,
      hostAuthToken
    );
    
    if (result.success) {
      console.log('✅ User created via class API:', result.user_id);
      return result.user_id;
    } else {
      console.error('❌ Class API creation failed:', result.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Class API exception:', error);
    return null;
  }
}

/**
 * Run all internal user API examples
 */
export async function runAllInternalUserExamples() {
  console.log('='.repeat(50));
  console.log('👤 Running Internal User API Examples');
  console.log('='.repeat(50));
  
  // Check for host auth token first
  const hostAuthToken = getHostAuthToken();
  console.log(`🔑 Host auth token available: ${hostAuthToken ? 'Yes' : 'No'}`);
  
  if (!hostAuthToken) {
    console.log('⚠️ To test user creation, store host_auth_token in localStorage:');
    console.log('   localStorage.setItem("host_auth_token", "your-token-here")');
    console.log('');
  }
  
  await testLocalStorageFunctionality();
  console.log('-'.repeat(30));
  
  await testErrorHandling();
  console.log('-'.repeat(30));
  
  if (hostAuthToken) {
    await createInternalUserExample();
    console.log('-'.repeat(30));
    
    await createUserSimplifiedExample();
    console.log('-'.repeat(30));
    
    await createUserFromLegacyFormat();
    console.log('-'.repeat(30));
    
    await testClassBasedAPI();
    console.log('-'.repeat(30));
    
    await testWithCustomAPIBaseURL();
  }
  
  console.log('='.repeat(50));
  console.log('✅ All internal user API examples completed');
  console.log('='.repeat(50));
}

// Export for potential use in testing or development
export default {
  createInternalUserExample,
  createUserSimplifiedExample,
  createUserFromLegacyFormat,
  testLocalStorageFunctionality,
  testWithCustomAPIBaseURL,
  testErrorHandling,
  testClassBasedAPI,
  runAllInternalUserExamples
};
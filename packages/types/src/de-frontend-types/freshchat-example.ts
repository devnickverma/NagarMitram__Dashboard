/**
 * Freshchat API Usage Examples
 * 
 * This file demonstrates how to use the Freshchat API integration
 * with the provided user data format.
 */

import { 
  createFreshchatUser, 
  getFreshchatUserByReferenceId, 
  getFreshchatUserById,
  freshchatAPI,
  IFreshchatUserRequest,
  getStoredFreshchatUser,
  getLastCreatedFreshchatUserId,
  getAllStoredFreshchatUsers,
  isUserStoredLocally
} from './freshchat';

/**
 * Example 1: Create a Freshchat user with the provided data
 */
export async function createUserExample() {
  const userRequest: IFreshchatUserRequest = {
    email: "johndae@mail.com",
    first_name: "John",
    last_name: "Dae",
    phone: "235689713",
    reference_id: "john@dae",
    jeweler_id: "CARTJA11720"
  };

  try {
    const result = await createFreshchatUser(userRequest);
    
    if (result.success) {
      console.log('✅ User created successfully:', {
        freshchat_user_id: result.freshchat_user_id,
        message: result.message,
        user_data: result.user_data
      });
      
      return result.freshchat_user_id;
    } else {
      console.error('❌ Failed to create user:', result.message);
      console.error('Error details:', result.error_details);
      return null;
    }
  } catch (error) {
    console.error('❌ Exception while creating user:', error);
    return null;
  }
}

/**
 * Example 2: Get user by reference ID
 */
export async function getUserByReferenceExample() {
  try {
    const result = await getFreshchatUserByReferenceId("john@dae");
    
    if (result.success) {
      console.log('✅ User retrieved successfully:', result.user_data);
      return result.user_data;
    } else {
      console.error('❌ Failed to get user:', result.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Exception while getting user:', error);
    return null;
  }
}

/**
 * Example 3: Full workflow - Create user and then retrieve it
 */
export async function fullWorkflowExample() {
  console.log('🚀 Starting Freshchat user workflow...');
  
  // Step 1: Create user
  const userId = await createUserExample();
  
  if (!userId) {
    console.log('❌ Workflow failed at user creation');
    return false;
  }
  
  // Step 2: Wait a moment for the user to be fully created
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Step 3: Retrieve user by reference ID
  const userData = await getUserByReferenceExample();
  
  if (userData) {
    console.log('✅ Workflow completed successfully!');
    console.log('Final user data:', userData);
    return true;
  } else {
    console.log('❌ Workflow failed at user retrieval');
    return false;
  }
}

/**
 * Example 4: Using the class-based API
 */
export async function classBasedAPIExample() {
  const userRequest: IFreshchatUserRequest = {
    email: "alice.smith@example.com",
    first_name: "Alice",
    last_name: "Smith",
    phone: "555-0123",
    reference_id: "alice@smith",
    jeweler_id: "JEWELR12345"
  };

  try {
    // Create user using class instance
    const createResult = await freshchatAPI.createUser(userRequest);
    
    if (createResult.success && createResult.freshchat_user_id) {
      console.log('✅ User created via class API:', createResult.freshchat_user_id);
      
      // Get user by ID
      const getResult = await freshchatAPI.getUserById(createResult.freshchat_user_id);
      
      if (getResult.success) {
        console.log('✅ User retrieved via class API:', getResult.user_data);
      }
      
      // Update user properties
      const updateResult = await freshchatAPI.updateUserProperties(
        createResult.freshchat_user_id,
        [
          { name: 'jeweler_id', value: 'UPDATED_JEWELR12345' },
          { name: 'customer_tier', value: 'Premium' }
        ]
      );
      
      if (updateResult.success) {
        console.log('✅ User properties updated:', updateResult.user_data);
      }
    }
  } catch (error) {
    console.error('❌ Class-based API example failed:', error);
  }
}

/**
 * Example 5: Error handling demonstration
 */
export async function errorHandlingExample() {
  // Try to create user with missing required fields
  const invalidRequest = {
    email: "incomplete@example.com",
    first_name: "Incomplete"
    // Missing last_name, reference_id, jeweler_id
  } as IFreshchatUserRequest;

  const result = await createFreshchatUser(invalidRequest);
  
  if (!result.success) {
    console.log('✅ Error handling working correctly:', result.message);
    console.log('Error details:', result.error_details);
  }
}

/**
 * Example 6: Get user by ID demonstration
 */
export async function getUserByIdExample() {
  console.log('🔍 Testing getUserById functionality...');
  
  // Use the ID of the user we created earlier
  const userId = "bca58840-2cdc-471f-af34-5928d38f6421";
  
  try {
    const result = await getFreshchatUserById(userId);
    
    if (result.success) {
      console.log('✅ User retrieved successfully by ID:', {
        user_id: result.user_data?.id,
        name: `${result.user_data?.first_name} ${result.user_data?.last_name}`,
        email: result.user_data?.email,
        reference_id: result.user_data?.reference_id,
        created_time: result.user_data?.created_time,
        updated_time: result.user_data?.updated_time,
        properties_count: result.user_data?.properties?.length || 0
      });
      
      // Show some of the properties
      if (result.user_data?.properties) {
        console.log('📋 User properties:');
        result.user_data.properties.forEach((prop: any) => {
          console.log(`  - ${prop.name}: ${prop.value}`);
        });
      }
      
      return result.user_data;
    } else {
      console.error('❌ Failed to get user by ID:', result.message);
      console.error('Error details:', result.error_details);
      return null;
    }
  } catch (error) {
    console.error('❌ Exception while getting user by ID:', error);
    return null;
  }
}

/**
 * Example 7: LocalStorage functionality demonstration
 */
export async function localStorageExample() {
  console.log('📦 Testing localStorage functionality...');
  
  // Create a user (this will automatically store in localStorage)
  const userRequest: IFreshchatUserRequest = {
    email: "storage.test@example.com",
    first_name: "Storage",
    last_name: "Test",
    phone: "555-9999",
    reference_id: "storage@test",
    jeweler_id: "STORAGE123"
  };

  const createResult = await createFreshchatUser(userRequest);
  
  if (createResult.success) {
    console.log('✅ User created and stored in localStorage');
    
    // Check if user is stored locally
    const isStored = isUserStoredLocally("storage@test");
    console.log('📍 User stored locally:', isStored);
    
    // Get stored user data
    const storedUser = getStoredFreshchatUser("storage@test");
    console.log('📄 Stored user data:', storedUser);
    
    // Get last created user ID
    const lastUserId = getLastCreatedFreshchatUserId();
    console.log('🆔 Last created user ID:', lastUserId);
    
    // Get all stored users
    const allUsers = getAllStoredFreshchatUsers();
    console.log('👥 Total stored users:', allUsers.length);
    
    return true;
  }
  
  return false;
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('='.repeat(50));
  console.log('🧪 Running Freshchat API Examples');
  console.log('='.repeat(50));
  
  await createUserExample();
  console.log('-'.repeat(30));
  
  await getUserByReferenceExample();
  console.log('-'.repeat(30));
  
  await classBasedAPIExample();
  console.log('-'.repeat(30));
  
  await errorHandlingExample();
  console.log('-'.repeat(30));
  
  await getUserByIdExample();
  console.log('-'.repeat(30));
  
  await localStorageExample();
  console.log('-'.repeat(30));
  
  await fullWorkflowExample();
  
  console.log('='.repeat(50));
  console.log('✅ All examples completed');
  console.log('='.repeat(50));
}

// Export for potential use in testing or development
export default {
  createUserExample,
  getUserByReferenceExample,
  fullWorkflowExample,
  classBasedAPIExample,
  errorHandlingExample,
  runAllExamples
};
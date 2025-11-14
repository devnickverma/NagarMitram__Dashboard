/**
 * Freshchat API Test Runner
 * Quick test to demonstrate the GET user by ID functionality
 */

import { getFreshchatUserById, getLastCreatedFreshchatUserId } from './freshchat';

/**
 * Test the GET user by ID API with the user we just created
 */
export async function testGetUserById() {
  console.log('🧪 Testing Freshchat GET User by ID API');
  console.log('='.repeat(50));
  
  // The user ID from our successful creation
  const testUserId = "bca58840-2cdc-471f-af34-5928d38f6421";
  
  console.log(`📋 Testing with User ID: ${testUserId}`);
  console.log(`🔗 API Endpoint: GET /v2/users/${testUserId}`);
  console.log('-'.repeat(30));
  
  try {
    const result = await getFreshchatUserById(testUserId);
    
    if (result.success && result.user_data) {
      console.log('✅ API Call Successful!');
      console.log('📊 User Details:');
      console.log(`   ID: ${result.user_data.id}`);
      console.log(`   Name: ${result.user_data.first_name} ${result.user_data.last_name}`);
      console.log(`   Email: ${result.user_data.email}`);
      console.log(`   Phone: ${result.user_data.phone}`);
      console.log(`   Reference ID: ${result.user_data.reference_id}`);
      console.log(`   Created: ${result.user_data.created_time}`);
      console.log(`   Updated: ${result.user_data.updated_time}`);
      console.log(`   Login Status: ${result.user_data.login_status}`);
      console.log(`   Org Contact ID: ${result.user_data.org_contact_id}`);
      
      if (result.user_data.properties && result.user_data.properties.length > 0) {
        console.log('\n📋 Properties:');
        result.user_data.properties.forEach((prop: any, index: number) => {
          console.log(`   ${index + 1}. ${prop.name}: ${prop.value}`);
        });
      }
      
      console.log('\n✅ GET User by ID API is working perfectly!');
      return true;
      
    } else {
      console.log('❌ API Call Failed:');
      console.log(`   Message: ${result.message}`);
      if (result.error_details) {
        console.log(`   Error Details:`, result.error_details);
      }
      return false;
    }
    
  } catch (error) {
    console.log('❌ Exception occurred:');
    console.log(`   Error: ${error}`);
    return false;
  }
}

/**
 * Test getting user from localStorage and then fetching fresh data
 */
export async function testStorageAndFetch() {
  console.log('\n🔄 Testing Storage + Fresh Fetch Workflow');
  console.log('='.repeat(50));
  
  try {
    // Get the last created user ID from localStorage
    const storedUserId = getLastCreatedFreshchatUserId();
    
    if (storedUserId) {
      console.log(`📦 Found stored user ID: ${storedUserId}`);
      console.log('🔄 Fetching fresh data from Freshchat...');
      
      const freshData = await getFreshchatUserById(storedUserId);
      
      if (freshData.success) {
        console.log('✅ Fresh data retrieved successfully!');
        console.log(`📊 User: ${freshData.user_data?.first_name} ${freshData.user_data?.last_name}`);
        console.log(`📧 Email: ${freshData.user_data?.email}`);
        console.log(`🕐 Last Updated: ${freshData.user_data?.updated_time}`);
        return true;
      } else {
        console.log('❌ Failed to fetch fresh data');
        return false;
      }
    } else {
      console.log('⚠️ No stored user ID found in localStorage');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Storage + Fetch test failed:', error);
    return false;
  }
}

/**
 * Run all GET user by ID tests
 */
export async function runGetUserByIdTests() {
  console.log('🚀 Starting Freshchat GET User by ID Tests\n');
  
  const test1 = await testGetUserById();
  const test2 = await testStorageAndFetch();
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 Test Results:');
  console.log(`   Direct GET by ID: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Storage + Fetch: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(50));
  
  return test1 && test2;
}

// Export for use in other files
export default { testGetUserById, testStorageAndFetch, runGetUserByIdTests };
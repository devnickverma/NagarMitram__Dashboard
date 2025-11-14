/**
 * Freshchat GET Conversation API Usage Examples
 * 
 * This file demonstrates how to retrieve conversation details from Freshchat
 * using the provided conversation structure.
 */

import { 
  getFreshchatConversation,
  freshchatAPI
} from './freshchat';

/**
 * Example 1: Get conversation by ID
 */
export async function getConversationExample() {
  console.log('🔍 Getting conversation details...');
  
  // Example conversation ID (from your provided data)
  const conversationId = "83dd2824-7090-4a10-877d-863f394c610f";
  
  try {
    const result = await getFreshchatConversation(conversationId);
    
    if (result.success && result.conversation_data) {
      console.log('✅ Conversation retrieved successfully:');
      console.log(`   Conversation ID: ${result.conversation_data.conversation_id}`);
      console.log(`   Channel ID: ${result.conversation_data.channel_id}`);
      console.log(`   Status: ${result.conversation_data.status}`);
      console.log(`   App ID: ${result.conversation_data.app_id}`);
      console.log(`   Assigned Agent ID: ${result.conversation_data.assigned_agent_id}`);
      console.log(`   Assigned Group ID: ${result.conversation_data.assigned_group_id}`);
      console.log(`   Messages Count: ${result.conversation_data.messages?.length || 0}`);
      console.log(`   Users Count: ${result.conversation_data.users?.length || 0}`);
      
      // Display properties
      if (result.conversation_data.properties) {
        console.log('\n📋 Properties:');
        Object.entries(result.conversation_data.properties).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      }
      
      // Display messages
      if (result.conversation_data.messages && result.conversation_data.messages.length > 0) {
        console.log('\n💬 Messages:');
        result.conversation_data.messages.forEach((message, index) => {
          console.log(`   ${index + 1}. [${message.actor_type}] ${message.message_parts[0]?.text?.content || 'No content'}`);
          console.log(`      ID: ${message.id}`);
          console.log(`      Created: ${message.created_time}`);
          console.log(`      User ID: ${message.user_id}`);
        });
      }
      
      // Display users
      if (result.conversation_data.users && result.conversation_data.users.length > 0) {
        console.log('\n👥 Users:');
        result.conversation_data.users.forEach((user, index) => {
          console.log(`   ${index + 1}. User ID: ${user.id}`);
        });
      }
      
      return result.conversation_data;
      
    } else {
      console.log('❌ Failed to get conversation:');
      console.log(`   Message: ${result.message}`);
      if (result.error_details) {
        console.log(`   Status: ${result.error_details.status}`);
        console.log(`   Status Text: ${result.error_details.statusText}`);
        if (result.error_details.data) {
          console.log(`   Error Data:`, result.error_details.data);
        }
      }
      return null;
    }
    
  } catch (error) {
    console.error('❌ Exception while getting conversation:', error);
    return null;
  }
}

/**
 * Example 2: Get conversation using class-based API
 */
export async function getConversationUsingClassAPI() {
  console.log('🔍 Getting conversation using class-based API...');
  
  const conversationId = "83dd2824-7090-4a10-877d-863f394c610f";
  
  try {
    // Using the class instance directly
    const result = await freshchatAPI.getConversation(conversationId);
    
    if (result.success) {
      console.log('✅ Conversation retrieved via class API');
      console.log(`   Conversation ID: ${result.conversation_data?.conversation_id}`);
      console.log(`   Status: ${result.conversation_data?.status}`);
      return result.conversation_data;
    } else {
      console.error('❌ Class API conversation retrieval failed:', result.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Class API exception:', error);
    return null;
  }
}

/**
 * Example 3: Error handling demonstration
 */
export async function conversationErrorHandlingExample() {
  console.log('🧪 Testing conversation error handling...');
  
  // Try to get conversation with invalid ID
  const result = await getFreshchatConversation("invalid-conversation-id");
  
  if (!result.success) {
    console.log('✅ Error handling working correctly:', result.message);
    if (result.error_details) {
      console.log('Error details:', {
        status: result.error_details.status,
        message: result.error_details.data?.message || 'No detailed message'
      });
    }
  } else {
    console.log('⚠️ Expected this to fail, but it succeeded');
  }
}

/**
 * Example 4: Test with different conversation IDs
 */
export async function testMultipleConversations() {
  console.log('🔄 Testing multiple conversation IDs...');
  
  const testConversationIds = [
    "83dd2824-7090-4a10-877d-863f394c610f", // From your example
    "e083b4c7-fc1e-4fa1-b9c4-e1497db5eabd", // From curl example
    "invalid-id-test" // Invalid for testing
  ];
  
  for (const conversationId of testConversationIds) {
    console.log(`\n📋 Testing conversation ID: ${conversationId}`);
    
    const result = await getFreshchatConversation(conversationId);
    
    if (result.success) {
      console.log(`✅ Found conversation: ${result.conversation_data?.status}`);
    } else {
      console.log(`❌ Failed: ${result.message}`);
      if (result.error_details?.status) {
        console.log(`   HTTP Status: ${result.error_details.status}`);
      }
    }
  }
}

/**
 * Example 5: Conversation data structure demonstration
 */
export async function demonstrateConversationStructure() {
  console.log('📊 Demonstrating expected conversation data structure...');
  
  // This shows the structure we expect based on your provided JSON
  const expectedStructure = {
    conversation_id: "83dd2824-7090-4a10-877d-863f394c610f",
    channel_id: "71df7c11-df1e-4365-80e3-75a434c9caf0",
    assigned_org_agent_id: "462153445185974756",
    assigned_agent_id: "1ad50c45-050b-4702-9300-478ddcf23c65",
    assigned_org_group_id: "",
    assigned_group_id: "e769cd13-0cd3-4d64-81ac-32657642a24d",
    messages: [
      {
        message_parts: [{ text: { content: "Hii! Need help in receiving the refund." } }],
        app_id: "1c4dabcf-61d5-4490-b1a5-d3ff62c8e664",
        actor_id: "86a76727-f5f7-40b5-8f93-309043646b1c20230415141608",
        org_actor_id: "1647242406397890560",
        id: "16bb7d43-d50e-48c9-b82a-80137a280d99",
        channel_id: "71df7c11-df1e-4365-80e3-75a434c9caf0",
        conversation_id: "83dd2824-7090-4a10-877d-863f394c610f",
        interaction_id: "746122323012625-1684913970239",
        message_type: "normal",
        actor_type: "user",
        created_time: "2023-05-24T07:39:30.239Z",
        user_id: "86a76727-f5f7-40b5-8f93-309043646b1c20230415141608",
        restrictResponse: false,
        botsPrivateNote: false
      }
    ],
    app_id: "1c4dabcf-61d5-4490-b1a5-d3ff62c8e664",
    status: "new",
    skill_id: 0,
    properties: {
      priority: "Low",
      cf_type: "General Query",
      cf_rating: "5"
    },
    users: [{ id: "86a76727-f5f7-40b5-8f93-309043646b1c20230415141608" }]
  };
  
  console.log('📋 Expected conversation structure:');
  console.log(`   - conversation_id: ${expectedStructure.conversation_id}`);
  console.log(`   - status: ${expectedStructure.status}`);
  console.log(`   - messages: ${expectedStructure.messages.length} message(s)`);
  console.log(`   - users: ${expectedStructure.users.length} user(s)`);
  console.log(`   - properties: ${Object.keys(expectedStructure.properties).length} property(ies)`);
  
  return expectedStructure;
}

/**
 * Run all conversation examples
 */
export async function runAllConversationExamples() {
  console.log('='.repeat(50));
  console.log('💬 Running Freshchat GET Conversation API Examples');
  console.log('='.repeat(50));
  
  await demonstrateConversationStructure();
  console.log('-'.repeat(30));
  
  await getConversationExample();
  console.log('-'.repeat(30));
  
  await getConversationUsingClassAPI();
  console.log('-'.repeat(30));
  
  await conversationErrorHandlingExample();
  console.log('-'.repeat(30));
  
  await testMultipleConversations();
  
  console.log('='.repeat(50));
  console.log('✅ All conversation examples completed');
  console.log('='.repeat(50));
}

// Export for potential use in testing or development
export default {
  getConversationExample,
  getConversationUsingClassAPI,
  conversationErrorHandlingExample,
  testMultipleConversations,
  demonstrateConversationStructure,
  runAllConversationExamples
};
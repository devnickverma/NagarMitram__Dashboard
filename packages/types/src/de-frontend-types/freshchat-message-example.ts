/**
 * Freshchat Message API Usage Examples
 * 
 * This file demonstrates how to send messages to Freshchat conversations
 * using the provided conversation structure.
 */

import { 
  sendFreshchatMessage,
  sendFreshchatTextMessage,
  sendFreshchatMessageWithQuickReplies,
  freshchatAPI,
  IFreshchatSendMessageRequest 
} from './freshchat';

/**
 * Example 1: Send a simple text message
 */
export async function sendSimpleMessageExample() {
  console.log('📩 Sending simple text message...');
  
  // Example conversation and user IDs (from your provided data)
  const conversationId = "83dd2824-7090-4a10-877d-863f394c610f";
  const userId = "86a76727-f5f7-40b5-8f93-309043646b1c20230415141608";
  const actorId = "1de5d130-1c62-48cf-8349-1b39c60d0c28"; // Agent ID
  
  try {
    const result = await sendFreshchatTextMessage(
      conversationId,
      "Thank you for contacting us about the refund. We'll help you process it right away!",
      userId,
      actorId,
      'agent', // actor_type
      false   // assume_identity
    );
    
    if (result.success) {
      console.log('✅ Message sent successfully:', {
        message_id: result.message_id,
        message: result.message
      });
      return result.message_id;
    } else {
      console.error('❌ Failed to send message:', result.message);
      console.error('Error details:', result.error_details);
      return null;
    }
  } catch (error) {
    console.error('❌ Exception while sending message:', error);
    return null;
  }
}

/**
 * Example 2: Send message with quick reply buttons (like your curl example)
 */
export async function sendMessageWithQuickRepliesExample() {
  console.log('📩 Sending message with quick reply buttons...');
  
  const conversationId = "83dd2824-7090-4a10-877d-863f394c610f";
  const userId = "86a76727-f5f7-40b5-8f93-309043646b1c20230415141608";  
  const actorId = "1de5d130-1c62-48cf-8349-1b39c60d0c28";
  
  try {
    const result = await sendFreshchatMessageWithQuickReplies(
      conversationId,
      "Do you Agree??", // Your exact message from curl example
      ["Yes", "No"],    // Your exact quick reply buttons
      userId,
      actorId,
      'agent',
      false // assume_identity
    );
    
    if (result.success) {
      console.log('✅ Message with quick replies sent successfully:', {
        message_id: result.message_id,
        message: result.message
      });
      return result.message_id;
    } else {
      console.error('❌ Failed to send message with quick replies:', result.message);
      console.error('Error details:', result.error_details);
      return null;
    }
  } catch (error) {
    console.error('❌ Exception while sending message with quick replies:', error);
    return null;
  }
}

/**
 * Example 3: Send custom message using the raw API (matching your curl exactly)
 */
export async function sendCustomMessageExample() {
  console.log('📩 Sending custom message (curl equivalent)...');
  
  const conversationId = "e083b4c7-fc1e-4fa1-b9c4-e1497db5eabd"; // From your curl example
  const userId = "186a0a5c-7d30-4cb3-9a55-9d6534cbbf26";         // From your curl example  
  const actorId = "1de5d130-1c62-48cf-8349-1b39c60d0c28";        // From your curl example
  
  // This matches your exact curl payload
  const messageRequest: IFreshchatSendMessageRequest = {
    message_parts: [
      {
        text: {
          content: 'Do you Agree??'
        }
      }
    ],
    reply_parts: [
      {
        collection: {
          sub_parts: [
            {
              quick_reply_button: {
                label: 'Yes'
              }
            },
            {
              quick_reply_button: {
                label: 'No'
              }
            }
          ]
        }
      }
    ],
    message_type: 'normal',
    actor_type: 'agent',
    user_id: userId,
    actor_id: actorId
  };
  
  try {
    const result = await sendFreshchatMessage(
      conversationId,
      messageRequest,
      false // assume_identity = false from your curl
    );
    
    if (result.success) {
      console.log('✅ Custom message sent successfully (curl equivalent):', {
        message_id: result.message_id,
        message: result.message,
        full_response: result.message_data
      });
      return result.message_id;
    } else {
      console.error('❌ Failed to send custom message:', result.message);
      console.error('Error details:', result.error_details);
      return null;
    }
  } catch (error) {
    console.error('❌ Exception while sending custom message:', error);
    return null;
  }
}

/**
 * Example 4: Send message using class-based API
 */
export async function sendMessageUsingClassAPI() {
  console.log('📩 Sending message using class-based API...');
  
  const conversationId = "83dd2824-7090-4a10-877d-863f394c610f";
  const userId = "86a76727-f5f7-40b5-8f93-309043646b1c20230415141608";
  const actorId = "1de5d130-1c62-48cf-8349-1b39c60d0c28";
  
  try {
    // Using the class instance directly
    const result = await freshchatAPI.sendTextMessage(
      conversationId,
      "I'll process your refund request. Please provide your order number.",
      userId,
      actorId,
      'agent'
    );
    
    if (result.success) {
      console.log('✅ Message sent via class API:', result.message_id);
      return result.message_id;
    } else {
      console.error('❌ Class API message failed:', result.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Class API exception:', error);
    return null;
  }
}

/**
 * Example 5: Error handling demonstration
 */
export async function messageErrorHandlingExample() {
  console.log('🧪 Testing message error handling...');
  
  // Try to send message with invalid conversation ID
  const result = await sendFreshchatTextMessage(
    "invalid-conversation-id",
    "This should fail",
    "invalid-user-id", 
    "invalid-actor-id"
  );
  
  if (!result.success) {
    console.log('✅ Error handling working correctly:', result.message);
    console.log('Error details:', result.error_details);
  } else {
    console.log('⚠️ Expected this to fail, but it succeeded');
  }
}

/**
 * Run all message examples
 */
export async function runAllMessageExamples() {
  console.log('='.repeat(50));
  console.log('📨 Running Freshchat Message API Examples');
  console.log('='.repeat(50));
  
  await sendSimpleMessageExample();
  console.log('-'.repeat(30));
  
  await sendMessageWithQuickRepliesExample();
  console.log('-'.repeat(30));
  
  await sendCustomMessageExample();
  console.log('-'.repeat(30));
  
  await sendMessageUsingClassAPI();
  console.log('-'.repeat(30));
  
  await messageErrorHandlingExample();
  
  console.log('='.repeat(50));
  console.log('✅ All message examples completed');
  console.log('='.repeat(50));
}

// Export for potential use in testing or development
export default {
  sendSimpleMessageExample,
  sendMessageWithQuickRepliesExample,
  sendCustomMessageExample,
  sendMessageUsingClassAPI,
  messageErrorHandlingExample,
  runAllMessageExamples
};
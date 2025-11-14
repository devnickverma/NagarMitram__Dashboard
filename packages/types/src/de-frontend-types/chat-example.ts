/**
 * Chat API Usage Examples
 * 
 * This file demonstrates how to use the chat API with AI and Freshchat handoff functionality.
 * The chat API automatically handles routing between AI chat and human agents based on handoff_to_human status.
 */

import { 
  sendChatMessage,
  sendSimpleChatMessage,
  getConversationMapping,
  isConversationHandedOffToHuman,
  clearConversationMapping,
  chatAPI,
  IChatRequest 
} from './chat';

/**
 * Example 1: Send a basic chat message to AI
 */
export async function sendBasicChatMessage() {
  console.log('💬 Sending basic chat message to AI...');

  const chatRequest: IChatRequest = {
    message: "Hello, I'm looking for a diamond engagement ring",
    user_id: process.env.TEST_USER_ID || "test-user-placeholder",
    session_id: process.env.TEST_SESSION_ID || "test-session-placeholder",
    stream: false,
    auth_token: process.env.NEXT_PUBLIC_DEV_API_KEY || "MISSING_DEV_API_KEY",
    metadata: {
      customer_context: "engagement_ring_shopping"
    }
  };

  try {
    const response = await sendChatMessage(chatRequest);

    if ('success' in response && !response.success) {
      console.error('❌ Chat message failed:', response.message);
      return null;
    }

    console.log('✅ Chat response received:', {
      response: response.response,
      handoff_to_human: response.handoff_to_human,
      conversation_id: response.conversation_id,
      freshchat_conversation_id: response.metadata.freshchat_conversation_id
    });

    // Check if conversation was handed off to human
    if (response.handoff_to_human) {
      console.log('🤝 Conversation has been handed off to human agent');
      console.log('   - Future messages will route to Freshchat');
    }

    return response;
  } catch (error) {
    console.error('❌ Error sending chat message:', error);
    return null;
  }
}

/**
 * Example 2: Send simplified chat message
 */
export async function sendSimplifiedChatMessage() {
  console.log('💬 Sending simplified chat message...');

  try {
    const response = await sendSimpleChatMessage(
      "What's the difference between VS1 and VS2 clarity?",
      "5b3d75ba-7155-4d68-899d-46b39b089ad7",
      "78fc9967-5e77-4172-b137-52bf808b98f1",
      "sk-1234",
      { topic: "diamond_education" },
      false // stream
    );

    if ('success' in response && !response.success) {
      console.error('❌ Simplified chat failed:', response.message);
      return null;
    }

    console.log('✅ Simplified chat response:', {
      response_length: response.response.length,
      billing_session_count: response.billing_session_count,
      timestamp: response.timestamp
    });

    return response;
  } catch (error) {
    console.error('❌ Error with simplified chat:', error);
    return null;
  }
}

/**
 * Example 3: Conversation with handoff scenario
 */
export async function demonstrateHandoffScenario() {
  console.log('🤝 Demonstrating handoff scenario...');

  const sessionId = "78fc9967-5e77-4172-b137-52bf808b98f1";
  const userId = "5b3d75ba-7155-4d68-899d-46b39b089ad7";
  const authToken = "sk-1234";

  try {
    // Step 1: Send initial message to AI
    console.log('Step 1: Sending initial message to AI...');
    let response = await sendSimpleChatMessage(
      "I need help with a very specific custom diamond design",
      userId,
      sessionId,
      authToken,
      { request_type: "complex_custom_design" }
    );

    if ('success' in response && !response.success) {
      console.error('❌ Initial message failed:', response.message);
      return;
    }

    console.log('Initial AI response received');

    // Step 2: Send follow-up that might trigger handoff
    console.log('Step 2: Sending complex request that might trigger handoff...');
    response = await sendSimpleChatMessage(
      "I need to recreate my grandmother's exact ring design from 1945 with specific historical gemstone sources",
      userId,
      sessionId,
      authToken,
      { complexity: "high", requires_expert: true }
    );

    if ('success' in response && !response.success) {
      console.error('❌ Follow-up message failed:', response.message);
      return;
    }

    // Check if handoff occurred
    if (response.handoff_to_human) {
      console.log('🤝 Handoff to human agent detected!');
      console.log('   - Freshchat conversation ID:', response.metadata.freshchat_conversation_id);

      // Step 3: Send message after handoff (should route to Freshchat)
      console.log('Step 3: Sending message after handoff (routes to Freshchat)...');
      const handoffResponse = await sendSimpleChatMessage(
        "Thank you for transferring me to a human agent. I have more details about the design.",
        userId,
        sessionId,
        authToken
      );

      if ('success' in handoffResponse && !handoffResponse.success) {
        console.error('❌ Handoff message failed:', handoffResponse.message);
      } else {
        console.log('✅ Message successfully routed to human agent via Freshchat');
      }
    }

  } catch (error) {
    console.error('❌ Error in handoff scenario:', error);
  }
}

/**
 * Example 4: Check conversation state and mappings
 */
export async function checkConversationState() {
  console.log('📊 Checking conversation state and mappings...');

  const sessionId = "78fc9967-5e77-4172-b137-52bf808b98f1";

  try {
    // Check if conversation is handed off
    const isHandedOff = isConversationHandedOffToHuman(sessionId);
    console.log(`🤝 Conversation handed off to human: ${isHandedOff}`);

    // Get conversation mapping
    const mapping = getConversationMapping(sessionId);
    if (mapping) {
      console.log('📋 Conversation mapping found:', {
        session_id: mapping.session_id,
        conversation_id: mapping.conversation_id,
        freshchat_conversation_id: mapping.freshchat_conversation_id,
        handoff_to_human: mapping.handoff_to_human,
        created_at: mapping.created_at,
        last_message_timestamp: mapping.last_message_timestamp
      });
    } else {
      console.log('❌ No conversation mapping found for session:', sessionId);
    }

    return {
      isHandedOff,
      mapping
    };
  } catch (error) {
    console.error('❌ Error checking conversation state:', error);
    return null;
  }
}

/**
 * Example 5: Handle streaming chat (when supported)
 */
export async function sendStreamingChatMessage() {
  console.log('🌊 Sending streaming chat message...');

  const chatRequest: IChatRequest = {
    message: "Can you explain the 4 Cs of diamonds in detail?",
    user_id: "5b3d75ba-7155-4d68-899d-46b39b089ad7",
    session_id: "78fc9967-5e77-4172-b137-52bf808b98f1",
    stream: true, // Enable streaming
    auth_token: "sk-1234",
    metadata: {
      response_format: "detailed_explanation"
    }
  };

  try {
    // Note: Streaming implementation depends on your backend
    // This example shows the request structure
    const response = await sendChatMessage(chatRequest);

    if ('success' in response && !response.success) {
      console.error('❌ Streaming chat failed:', response.message);
      return null;
    }

    console.log('✅ Streaming chat response received:', {
      stream_enabled: chatRequest.stream,
      response_preview: response.response.substring(0, 100) + '...'
    });

    return response;
  } catch (error) {
    console.error('❌ Error with streaming chat:', error);
    return null;
  }
}

/**
 * Example 6: Using class-based API
 */
export async function useClassBasedChatAPI() {
  console.log('🏗️ Using class-based chat API...');

  const chatRequest: IChatRequest = {
    message: "What's your return policy for custom jewelry?",
    user_id: "5b3d75ba-7155-4d68-899d-46b39b089ad7",
    session_id: "78fc9967-5e77-4172-b137-52bf808b98f1",
    stream: false,
    auth_token: "sk-1234",
    metadata: {
      inquiry_type: "policy_question"
    }
  };

  try {
    // Using the class instance directly
    const response = await chatAPI.sendMessage(chatRequest);

    if ('success' in response && !response.success) {
      console.error('❌ Class-based chat failed:', response.message);
      return null;
    }

    console.log('✅ Class-based chat response received');
    return response;
  } catch (error) {
    console.error('❌ Class-based chat error:', error);
    return null;
  }
}

/**
 * Example 7: Clear conversation data
 */
export async function clearConversationData() {
  console.log('🗑️ Clearing conversation data...');

  const sessionId = "78fc9967-5e77-4172-b137-52bf808b98f1";

  try {
    const success = clearConversationMapping(sessionId);
    if (success) {
      console.log('✅ Conversation mapping cleared successfully');
    } else {
      console.log('❌ Failed to clear conversation mapping (may not exist)');
    }

    return success;
  } catch (error) {
    console.error('❌ Error clearing conversation data:', error);
    return false;
  }
}

/**
 * Example 8: Complete conversation flow
 */
export async function completeConversationFlow() {
  console.log('🔄 Running complete conversation flow...');

  const sessionId = "78fc9967-5e77-4172-b137-52bf808b98f1";
  const userId = "5b3d75ba-7155-4d68-899d-46b39b089ad7";
  const authToken = "sk-1234";

  try {
    // Clear any existing conversation data
    clearConversationMapping(sessionId);

    // Start conversation
    console.log('1. Starting conversation...');
    await sendSimpleChatMessage(
      "Hi, I'm interested in buying an engagement ring",
      userId,
      sessionId,
      authToken
    );

    // Ask for recommendations
    console.log('2. Asking for recommendations...');
    await sendSimpleChatMessage(
      "What would you recommend for a $5000 budget?",
      userId,
      sessionId,
      authToken,
      { budget: 5000, category: "engagement_ring" }
    );

    // Ask complex question that might trigger handoff
    console.log('3. Asking complex question...');
    const handoffResponse = await sendSimpleChatMessage(
      "I need help with insurance valuation and certification authentication for a vintage diamond",
      userId,
      sessionId,      
      authToken,
      { complexity: "high", requires_specialist: true }
    );

    // Check final state
    const finalState = await checkConversationState();
    console.log('4. Final conversation state:', finalState);

    console.log('✅ Complete conversation flow finished');
    return finalState;

  } catch (error) {
    console.error('❌ Error in complete conversation flow:', error);
    return null;
  }
}

/**
 * Run all chat API examples
 */
export async function runAllChatExamples() {
  console.log('='.repeat(50));
  console.log('💬 Running Chat API Examples');
  console.log('='.repeat(50));

  await sendBasicChatMessage();
  console.log('-'.repeat(30));

  await sendSimplifiedChatMessage();
  console.log('-'.repeat(30));

  await checkConversationState();
  console.log('-'.repeat(30));

  await sendStreamingChatMessage();
  console.log('-'.repeat(30));

  await useClassBasedChatAPI();
  console.log('-'.repeat(30));

  await demonstrateHandoffScenario();
  console.log('-'.repeat(30));

  await completeConversationFlow();
  console.log('-'.repeat(30));

  await clearConversationData();

  console.log('='.repeat(50));
  console.log('✅ All chat API examples completed');
  console.log('='.repeat(50));
}

// Export for potential use in testing or development
export default {
  sendBasicChatMessage,
  sendSimplifiedChatMessage,
  demonstrateHandoffScenario,
  checkConversationState,
  sendStreamingChatMessage,
  useClassBasedChatAPI,
  clearConversationData,
  completeConversationFlow,
  runAllChatExamples
};
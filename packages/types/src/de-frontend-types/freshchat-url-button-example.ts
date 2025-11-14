/**
 * Freshchat URL Button API Usage Examples
 * 
 * This file demonstrates how to send messages with URL buttons to Freshchat conversations
 * using the provided message structure with url_button support.
 */

import { 
  sendFreshchatMessageWithUrlButtons,
  sendFreshchatMessageWithMixedButtons,
  sendFreshchatMessage,
  freshchatAPI,
  IFreshchatSendMessageRequest 
} from './freshchat';

/**
 * Example 1: Send message with URL button (matching your exact structure)
 */
export async function sendMessageWithUrlButtonExample() {
  console.log('🔗 Sending message with URL button...');
  
  const conversationId = "83dd2824-7090-4a10-877d-863f394c610f";
  const userId = "86a76727-f5f7-40b5-8f93-309043646b1c20230415141608";
  const actorId = "1de5d130-1c62-48cf-8349-1b39c60d0c28";
  
  try {
    const result = await sendFreshchatMessageWithUrlButtons(
      conversationId,
      "For further information, check out Freshchat API documentation.", // Your exact message
      [
        {
          url: "https://developers.freshchat.com/api/",
          label: "Click for API documentation",
          target: "_blank" // Your exact target
        }
      ],
      userId,
      actorId,
      'agent'
    );
    
    if (result.success) {
      console.log('✅ Message with URL button sent successfully:', {
        message_id: result.message_id,
        message: result.message
      });
      return result.message_id;
    } else {
      console.error('❌ Failed to send message with URL button:', result.message);
      console.error('Error details:', result.error_details);
      return null;
    }
  } catch (error) {
    console.error('❌ Exception while sending message with URL button:', error);
    return null;
  }
}

/**
 * Example 2: Send message using raw API (exact structure from your JSON)
 */
export async function sendRawMessageWithUrlButtonExample() {
  console.log('🔗 Sending raw message with URL button (exact JSON structure)...');
  
  const conversationId = "b0247bdb-2796-4489-bd0a-09c22b5440dc"; // From your example
  const userId = "86a76727-f5f7-40b5-8f93-309043646b1c20230415141608";
  const actorId = "1de5d130-1c62-48cf-8349-1b39c60d0c28";
  
  // This matches your exact message structure
  const messageRequest: IFreshchatSendMessageRequest = {
    message_parts: [{
      text: {
        content: "For further information, check out Freshchat API documentation."
      }
    }],
    reply_parts: [{
      collection: {
        sub_parts: [{
          url_button: {
            url: "https://developers.freshchat.com/api/",
            label: "Click for API documentation",
            target: "_blank"
          }
        }]
      }
    }],
    message_type: 'normal',
    actor_type: 'agent',
    user_id: userId,
    actor_id: actorId
  };
  
  try {
    const result = await sendFreshchatMessage(
      conversationId,
      messageRequest,
      false
    );
    
    if (result.success) {
      console.log('✅ Raw message with URL button sent successfully:', {
        message_id: result.message_id,
        message: result.message,
        full_response: result.message_data
      });
      return result.message_id;
    } else {
      console.error('❌ Failed to send raw message with URL button:', result.message);
      console.error('Error details:', result.error_details);
      return null;
    }
  } catch (error) {
    console.error('❌ Exception while sending raw message with URL button:', error);
    return null;
  }
}

/**
 * Example 3: Send message with multiple URL buttons
 */
export async function sendMessageWithMultipleUrlButtonsExample() {
  console.log('🔗 Sending message with multiple URL buttons...');
  
  const conversationId = "83dd2824-7090-4a10-877d-863f394c610f";
  const userId = "86a76727-f5f7-40b5-8f93-309043646b1c20230415141608";
  const actorId = "1de5d130-1c62-48cf-8349-1b39c60d0c28";
  
  try {
    const result = await sendFreshchatMessageWithUrlButtons(
      conversationId,
      "Here are some helpful resources for you:",
      [
        {
          url: "https://developers.freshchat.com/api/",
          label: "API Documentation",
          target: "_blank"
        },
        {
          url: "https://support.freshchat.com/",
          label: "Support Center",
          target: "_blank"
        },
        {
          url: "https://community.freshworks.com/",
          label: "Community Forum",
          target: "_blank"
        }
      ],
      userId,
      actorId,
      'agent'
    );
    
    if (result.success) {
      console.log('✅ Message with multiple URL buttons sent successfully:', result.message_id);
      return result.message_id;
    } else {
      console.error('❌ Failed to send message with multiple URL buttons:', result.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Exception while sending message with multiple URL buttons:', error);
    return null;
  }
}

/**
 * Example 4: Send message with mixed buttons (quick replies + URL buttons)
 */
export async function sendMessageWithMixedButtonsExample() {
  console.log('🔗 Sending message with mixed buttons (quick replies + URL)...');
  
  const conversationId = "83dd2824-7090-4a10-877d-863f394c610f";
  const userId = "86a76727-f5f7-40b5-8f93-309043646b1c20230415141608";
  const actorId = "1de5d130-1c62-48cf-8349-1b39c60d0c28";
  
  try {
    const result = await sendFreshchatMessageWithMixedButtons(
      conversationId,
      "Need help with your refund? Choose an option below or visit our help center:",
      ["Yes, help me", "No, I'm good"], // Quick reply buttons
      [
        {
          url: "https://help.example.com/refunds",
          label: "Refund Help Center",
          target: "_blank"
        },
        {
          url: "https://support.example.com/contact",
          label: "Contact Support",
          target: "_blank"
        }
      ], // URL buttons
      userId,
      actorId,
      'agent'
    );
    
    if (result.success) {
      console.log('✅ Message with mixed buttons sent successfully:', result.message_id);
      return result.message_id;
    } else {
      console.error('❌ Failed to send message with mixed buttons:', result.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Exception while sending message with mixed buttons:', error);
    return null;
  }
}

/**
 * Example 5: URL button with different targets
 */
export async function sendMessageWithDifferentTargetsExample() {
  console.log('🔗 Sending message with different URL targets...');
  
  const conversationId = "83dd2824-7090-4a10-877d-863f394c610f";
  const userId = "86a76727-f5f7-40b5-8f93-309043646b1c20230415141608";
  const actorId = "1de5d130-1c62-48cf-8349-1b39c60d0c28";
  
  try {
    const result = await sendFreshchatMessageWithUrlButtons(
      conversationId,
      "Choose how you'd like to open these links:",
      [
        {
          url: "https://example.com/new-tab",
          label: "Open in New Tab",
          target: "_blank"
        },
        {
          url: "https://example.com/same-tab",
          label: "Open in Same Tab",
          target: "_self"
        }
      ],
      userId,
      actorId,
      'agent'
    );
    
    if (result.success) {
      console.log('✅ Message with different URL targets sent successfully:', result.message_id);
      return result.message_id;
    } else {
      console.error('❌ Failed to send message with different URL targets:', result.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Exception while sending message with different URL targets:', error);
    return null;
  }
}

/**
 * Example 6: Using class-based API for URL buttons
 */
export async function sendUrlButtonUsingClassAPI() {
  console.log('🔗 Sending URL button message using class-based API...');
  
  const conversationId = "83dd2824-7090-4a10-877d-863f394c610f";
  const userId = "86a76727-f5f7-40b5-8f93-309043646b1c20230415141608";
  const actorId = "1de5d130-1c62-48cf-8349-1b39c60d0c28";
  
  try {
    // Using the class instance directly
    const result = await freshchatAPI.sendMessageWithUrlButtons(
      conversationId,
      "Visit our website for more information:",
      [
        {
          url: "https://www.example.com",
          label: "Visit Website",
          target: "_blank"
        }
      ],
      userId,
      actorId,
      'agent'
    );
    
    if (result.success) {
      console.log('✅ URL button message sent via class API:', result.message_id);
      return result.message_id;
    } else {
      console.error('❌ Class API URL button message failed:', result.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Class API exception:', error);
    return null;
  }
}

/**
 * Run all URL button examples
 */
export async function runAllUrlButtonExamples() {
  console.log('='.repeat(50));
  console.log('🔗 Running Freshchat URL Button API Examples');
  console.log('='.repeat(50));
  
  await sendMessageWithUrlButtonExample();
  console.log('-'.repeat(30));
  
  await sendRawMessageWithUrlButtonExample();
  console.log('-'.repeat(30));
  
  await sendMessageWithMultipleUrlButtonsExample();
  console.log('-'.repeat(30));
  
  await sendMessageWithMixedButtonsExample();
  console.log('-'.repeat(30));
  
  await sendMessageWithDifferentTargetsExample();
  console.log('-'.repeat(30));
  
  await sendUrlButtonUsingClassAPI();
  
  console.log('='.repeat(50));
  console.log('✅ All URL button examples completed');
  console.log('='.repeat(50));
}

// Export for potential use in testing or development
export default {
  sendMessageWithUrlButtonExample,
  sendRawMessageWithUrlButtonExample,
  sendMessageWithMultipleUrlButtonsExample,
  sendMessageWithMixedButtonsExample,
  sendMessageWithDifferentTargetsExample,
  sendUrlButtonUsingClassAPI,
  runAllUrlButtonExamples
};
/**
 * Chat Context Provider
 * Provides website context from sessionStorage to AI chat service
 */

import { browserDataRetriever } from './browser-data-retriever';

export interface IChatContext {
  websiteData?: {
    url: string;
    title: string;
    hostname: string;
    hasStoredData: boolean;
    lastDataUpdate?: string;
    keyElements?: string[];
    summary?: string;
  };
  userSession?: {
    sessionId: string;
    timestamp: string;
    tabId: string;
  };
  metadata?: Record<string, any>;
}

class ChatContextProvider {
  /**
   * Get comprehensive website context for AI chat
   */
  getWebsiteContext(): IChatContext {
    try {
      // Get website context from sessionStorage
      const websiteContext = browserDataRetriever.getCurrentWebsiteContext();
      const chatContext = browserDataRetriever.getWebsiteContextForChat();
      
      // Get session information
      const sessionId = sessionStorage.getItem('ashi_session_id') || 'unknown';
      const tabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      const context: IChatContext = {
        websiteData: {
          url: websiteContext.url,
          title: websiteContext.title,
          hostname: websiteContext.hostname,
          hasStoredData: websiteContext.hasStoredData,
          lastDataUpdate: websiteContext.lastDataUpdate,
          keyElements: chatContext?.keyElements || [],
          summary: chatContext?.summary || 'No website data available'
        },
        userSession: {
          sessionId,
          timestamp: new Date().toISOString(),
          tabId
        },
        metadata: {
          storageType: 'sessionStorage',
          dataSource: 'browser-extraction',
          isolationType: 'per-tab'
        }
      };

      console.log('✅ [ChatContextProvider] Generated website context:', {
        hasWebsiteData: !!context.websiteData?.hasStoredData,
        hostname: context.websiteData?.hostname,
        elementsCount: context.websiteData?.keyElements?.length || 0,
        sessionId: context.userSession?.sessionId
      });

      return context;
      
    } catch (error) {
      console.error('❌ [ChatContextProvider] Failed to get website context:', error);
      
      // Return minimal context in case of error
      return {
        websiteData: {
          url: window.location.href,
          title: document.title,
          hostname: window.location.hostname,
          hasStoredData: false,
          summary: 'Failed to retrieve website data'
        },
        userSession: {
          sessionId: 'error',
          timestamp: new Date().toISOString(),
          tabId: 'error'
        },
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get website context optimized for chat message context
   */
  getChatMessageContext(): Record<string, any> {
    const fullContext = this.getWebsiteContext();
    
    return {
      sessionData: {
        websiteUrl: fullContext.websiteData?.url,
        websiteTitle: fullContext.websiteData?.title,
        websiteHostname: fullContext.websiteData?.hostname,
        hasWebsiteData: fullContext.websiteData?.hasStoredData,
        keyElements: fullContext.websiteData?.keyElements?.slice(0, 5), // Limit for performance
        sessionId: fullContext.userSession?.sessionId,
        timestamp: fullContext.userSession?.timestamp
      },
      userPreferences: {
        storageType: 'sessionStorage',
        isolationType: 'per-tab',
        contextSource: 'browser-extraction'
      }
    };
  }

  /**
   * Get simplified website summary for AI context
   */
  getWebsiteSummary(): string {
    try {
      const context = browserDataRetriever.getWebsiteContextForChat();
      
      if (!context) {
        return `User is on ${window.location.hostname} but no detailed website data is available.`;
      }

      let summary = `User is currently on: ${context.summary}\n`;
      
      if (context.keyElements.length > 0) {
        summary += `\nKey interactive elements on this page:\n`;
        context.keyElements.slice(0, 5).forEach((element, index) => {
          summary += `${index + 1}. ${element}\n`;
        });
      }

      summary += `\nI can help the user interact with this website or answer questions about the content.`;
      
      return summary;
      
    } catch (error) {
      console.error('❌ [ChatContextProvider] Failed to get website summary:', error);
      return `User is on ${window.location.hostname}. Unable to retrieve detailed website context.`;
    }
  }

  /**
   * Check if website data is available
   */
  hasWebsiteData(): boolean {
    try {
      const data = browserDataRetriever.getLatestHtmlData();
      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Debug method to show all available context
   */
  debugContext(): void {
    console.group('🔍 [ChatContextProvider] Debug Context');
    
    const context = this.getWebsiteContext();
    console.log('📊 Full Context:', context);
    
    const chatContext = this.getChatMessageContext();
    console.log('💬 Chat Message Context:', chatContext);
    
    const summary = this.getWebsiteSummary();
    console.log('📄 Website Summary:', summary);
    
    console.log('📈 Storage Stats:', browserDataRetriever.getStorageStats?.());
    
    console.groupEnd();
  }
}

// Singleton instance
export const chatContextProvider = new ChatContextProvider();

// Export for global access
declare global {
  interface Window {
    chatContextProvider: ChatContextProvider;
  }
}

if (typeof window !== 'undefined') {
  window.chatContextProvider = chatContextProvider;
}
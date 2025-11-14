/**
 * Browser Data Retriever
 * Retrieves HTML data stored in browser storage instead of server files
 */

export interface IBrowserStoredData {
  type: string;
  payload: {
    url: string;
    title: string;
    html: string;
    timestamp: string;
    extractedAt: number;
    trigger: string;
    captureContext: string;
  };
}

class BrowserDataRetriever {
  /**
   * Get latest HTML data from browser storage (replaces reading latest.json from server)
   */
  getLatestHtmlData(): IBrowserStoredData | null {
    try {
      const hostname = window.location.hostname;
      const storageKey = `${hostname}_ashi_html_data_latest`;
      
      const stored = sessionStorage.getItem(storageKey);
      if (!stored) {
        console.log('📭 [BrowserDataRetriever] No HTML data found in browser storage');
        return null;
      }

      const data = JSON.parse(stored) as IBrowserStoredData;
      console.log('✅ [BrowserDataRetriever] Retrieved HTML data from browser storage:', {
        url: data.payload.url,
        title: data.payload.title,
        timestamp: data.payload.timestamp,
        dataSize: stored.length
      });

      return data;
    } catch (error) {
      console.error('❌ [BrowserDataRetriever] Failed to retrieve HTML data:', error);
      return null;
    }
  }

  /**
   * Get HTML data history from browser storage
   */
  getHtmlDataHistory(): IBrowserStoredData[] {
    try {
      const hostname = window.location.hostname;
      const historyKey = `${hostname}_ashi_html_data_history`;
      
      const stored = sessionStorage.getItem(historyKey);
      if (!stored) {
        return [];
      }

      const history = JSON.parse(stored) as IBrowserStoredData[];
      console.log(`📚 [BrowserDataRetriever] Retrieved ${history.length} HTML data entries from history`);
      
      return history;
    } catch (error) {
      console.error('❌ [BrowserDataRetriever] Failed to retrieve HTML data history:', error);
      return [];
    }
  }

  /**
   * Get current website context for chat
   */
  getCurrentWebsiteContext(): {
    url: string;
    title: string;
    hostname: string;
    hasStoredData: boolean;
    lastDataUpdate?: string;
  } {
    const url = window.location.href;
    const title = document.title;
    const hostname = window.location.hostname;
    
    const latestData = this.getLatestHtmlData();
    
    return {
      url,
      title,
      hostname,
      hasStoredData: !!latestData,
      lastDataUpdate: latestData?.payload.timestamp
    };
  }

  /**
   * Extract key information from stored HTML data for chat context
   */
  getWebsiteContextForChat(): {
    summary: string;
    keyElements: string[];
    lastUpdate: string;
  } | null {
    const data = this.getLatestHtmlData();
    
    if (!data) {
      return null;
    }

    // Simple extraction of key information
    const html = data.payload.html;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    // Extract key elements
    const keyElements: string[] = [];
    
    // Add buttons
    doc.querySelectorAll('button').forEach(btn => {
      const text = btn.textContent?.trim();
      if (text && text.length < 50) {
        keyElements.push(`Button: "${text}"`);
      }
    });
    
    // Add form inputs
    doc.querySelectorAll('input[type="submit"], input[type="button"]').forEach(input => {
      const value = input.getAttribute('value');
      if (value) {
        keyElements.push(`Input: "${value}"`);
      }
    });
    
    // Add major headings
    doc.querySelectorAll('h1, h2').forEach(heading => {
      const text = heading.textContent?.trim();
      if (text && text.length < 100) {
        keyElements.push(`Heading: "${text}"`);
      }
    });

    // Limit to most relevant elements
    const limitedElements = keyElements.slice(0, 10);

    const summary = `Website: ${data.payload.title} (${new URL(data.payload.url).hostname})
Last captured: ${new Date(data.payload.timestamp).toLocaleString()}
Key interactive elements found: ${limitedElements.length}`;

    return {
      summary,
      keyElements: limitedElements,
      lastUpdate: data.payload.timestamp
    };
  }

  /**
   * Clear all browser-stored HTML data for current site
   */
  clearAllHtmlData(): void {
    try {
      const hostname = window.location.hostname;
      const keysToRemove = [
        `${hostname}_ashi_html_data_latest`,
        `${hostname}_ashi_html_data_history`
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log('✅ [BrowserDataRetriever] Cleared all HTML data for', hostname);
    } catch (error) {
      console.error('❌ [BrowserDataRetriever] Failed to clear HTML data:', error);
    }
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): {
    hasLatestData: boolean;
    historyCount: number;
    totalStorageSize: number;
    lastUpdate?: string;
  } {
    try {
      const hostname = window.location.hostname;
      const latestKey = `${hostname}_ashi_html_data_latest`;
      const historyKey = `${hostname}_ashi_html_data_history`;

      const latestData = localStorage.getItem(latestKey);
      const historyData = localStorage.getItem(historyKey);

      const latestSize = latestData ? new Blob([latestData]).size : 0;
      const historySize = historyData ? new Blob([historyData]).size : 0;
      const historyCount = historyData ? JSON.parse(historyData).length : 0;

      let lastUpdate;
      if (latestData) {
        const parsed = JSON.parse(latestData);
        lastUpdate = parsed.payload?.timestamp;
      }

      return {
        hasLatestData: !!latestData,
        historyCount,
        totalStorageSize: latestSize + historySize,
        lastUpdate
      };
    } catch (error) {
      console.error('❌ [BrowserDataRetriever] Failed to get storage stats:', error);
      return {
        hasLatestData: false,
        historyCount: 0,
        totalStorageSize: 0
      };
    }
  }

  /**
   * Debug method to show all stored data
   */
  debugStoredData(): void {
    console.group('🔍 [BrowserDataRetriever] Debug Info');
    
    const stats = this.getStorageStats();
    console.log('📊 Storage Stats:', stats);
    
    const context = this.getCurrentWebsiteContext();
    console.log('🌐 Website Context:', context);
    
    const chatContext = this.getWebsiteContextForChat();
    if (chatContext) {
      console.log('💬 Chat Context:', chatContext);
    } else {
      console.log('❌ No chat context available');
    }
    
    console.groupEnd();
  }
}

// Singleton instance
export const browserDataRetriever = new BrowserDataRetriever();

// Export for global access
declare global {
  interface Window {
    browserDataRetriever: BrowserDataRetriever;
  }
}

if (typeof window !== 'undefined') {
  window.browserDataRetriever = browserDataRetriever;
}
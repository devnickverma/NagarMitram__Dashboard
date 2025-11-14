/**
 * Browser HTML Storage System
 * Stores HTML extraction data directly in browser storage instead of server files
 */

export interface IExtractedData {
  metadata: {
    title: string;
    description: string;
    url: string;
    extractedAt: string;
  };
  content: {
    headings: string[];
    paragraphs: string[];
    text: string;
  };
  links: {
    internal: string[];
    external: string[];
  };
  media: {
    images: string[];
    videos: string[];
  };
  id: string;
  sessionId: string;
  tags: string[];
  timestamp: number;
  captureContext: string;
  trigger: string;
}

class BrowserHtmlStorage {
  private readonly STORAGE_PREFIX = 'ashi_html_data';
  
  // Generate user-specific storage key
  private getUserStorageKey(): string {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'default';
    const userKey = `user_${hostname}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if user already has a storage key
    const existingUserKey = localStorage.getItem(`${hostname}_current_user_html_key`);
    if (existingUserKey) {
      return existingUserKey;
    }
    
    // Store new user key for this session
    localStorage.setItem(`${hostname}_current_user_html_key`, userKey);
    return userKey;
  }

  private get LATEST_DATA_KEY(): string {
    return `${this.getUserStorageKey()}_${this.STORAGE_PREFIX}_latest`;
  }

  private get HISTORY_DATA_KEY(): string {
    return `${this.getUserStorageKey()}_${this.STORAGE_PREFIX}_history`;
  }

  /**
   * Simple HTML data extractor (client-side version)
   */
  private extractHtmlData(html: string, url: string): IExtractedData {
    // Create a temporary DOM element to parse HTML safely
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Extract title
    const titleElement = tempDiv.querySelector('title');
    const title = titleElement ? titleElement.textContent || 'Untitled' : 'Untitled';

    // Extract description from meta tag
    const descriptionMeta = tempDiv.querySelector('meta[name="description"]');
    const description = descriptionMeta ? descriptionMeta.getAttribute('content') || '' : '';

    // Extract headings
    const headings: string[] = [];
    tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
      if (heading.textContent) {
        headings.push(heading.textContent.trim());
      }
    });

    // Extract paragraphs
    const paragraphs: string[] = [];
    tempDiv.querySelectorAll('p').forEach(p => {
      if (p.textContent && p.textContent.trim().length > 20) {
        paragraphs.push(p.textContent.trim());
      }
    });

    // Extract links
    const internal: string[] = [];
    const external: string[] = [];
    tempDiv.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        if (href.startsWith('http') || href.startsWith('//')) {
          external.push(href);
        } else {
          internal.push(href);
        }
      }
    });

    // Extract images
    const images: string[] = [];
    tempDiv.querySelectorAll('img[src]').forEach(img => {
      const src = img.getAttribute('src');
      if (src) {
        images.push(src);
      }
    });

    // Extract videos
    const videos: string[] = [];
    tempDiv.querySelectorAll('video[src], video source[src]').forEach(video => {
      const src = video.getAttribute('src');
      if (src) {
        videos.push(src);
      }
    });

    // Clean up
    tempDiv.remove();

    return {
      metadata: {
        title,
        description,
        url,
        extractedAt: new Date().toISOString(),
      },
      content: {
        headings,
        paragraphs,
        text: html.replace(/<[^>]*>/g, '').substring(0, 1000),
      },
      links: {
        internal,
        external,
      },
      media: {
        images,
        videos,
      },
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      sessionId: this.getUserStorageKey(),
      tags: ['auto-fetched', 'host-website', 'browser-stored'],
      timestamp: Date.now(),
      captureContext: 'browser-extraction',
      trigger: 'client-side',
    };
  }

  /**
   * Store HTML data in browser storage (replaces server-side latest.json)
   */
  storeHtmlData(htmlData: any): Promise<{ success: boolean; data?: IExtractedData; error?: string }> {
    return new Promise((resolve) => {
      try {
        // Extract raw HTML and URL from payload
        const rawHtml = htmlData.payload?.html || '';
        const url = htmlData.payload?.url || '';

        if (!rawHtml || !url) {
          resolve({
            success: false,
            error: 'Missing HTML or URL data'
          });
          return;
        }

        // Process HTML into structured data
        const extractedData = this.extractHtmlData(rawHtml, url);
        
        // Add additional metadata from payload
        extractedData.captureContext = htmlData.payload?.captureContext || 'browser-extraction';
        extractedData.trigger = htmlData.payload?.trigger || 'client-side';

        // Store as "latest" data (equivalent to latest.json)
        localStorage.setItem(this.LATEST_DATA_KEY, JSON.stringify(extractedData));

        // Also store in history
        this.addToHistory(extractedData);

        console.log('✅ [BrowserHtmlStorage] Data stored successfully:', {
          url,
          dataSize: JSON.stringify(extractedData).length,
          storageKey: this.LATEST_DATA_KEY
        });

        resolve({
          success: true,
          data: extractedData
        });

      } catch (error) {
        console.error('❌ [BrowserHtmlStorage] Failed to store HTML data:', error);
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  }

  /**
   * Get latest stored HTML data (replaces reading latest.json)
   */
  getLatestData(): IExtractedData | null {
    try {
      const stored = localStorage.getItem(this.LATEST_DATA_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('❌ [BrowserHtmlStorage] Failed to get latest data:', error);
      return null;
    }
  }

  /**
   * Add data to history
   */
  private addToHistory(data: IExtractedData): void {
    try {
      const historyKey = this.HISTORY_DATA_KEY;
      const existingHistory = localStorage.getItem(historyKey);
      const history: IExtractedData[] = existingHistory ? JSON.parse(existingHistory) : [];

      // Add new data to beginning of array
      history.unshift(data);

      // Keep only last 10 entries to prevent storage overflow
      if (history.length > 10) {
        history.splice(10);
      }

      localStorage.setItem(historyKey, JSON.stringify(history));
    } catch (error) {
      console.warn('⚠️ [BrowserHtmlStorage] Failed to update history:', error);
    }
  }

  /**
   * Get HTML data history
   */
  getHistory(): IExtractedData[] {
    try {
      const stored = localStorage.getItem(this.HISTORY_DATA_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ [BrowserHtmlStorage] Failed to get history:', error);
      return [];
    }
  }

  /**
   * Clear all stored HTML data for current user
   */
  clearAllData(): void {
    try {
      localStorage.removeItem(this.LATEST_DATA_KEY);
      localStorage.removeItem(this.HISTORY_DATA_KEY);
      console.log('✅ [BrowserHtmlStorage] All data cleared');
    } catch (error) {
      console.error('❌ [BrowserHtmlStorage] Failed to clear data:', error);
    }
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): {
    hasLatestData: boolean;
    historyCount: number;
    totalStorageSize: number;
    latestDataSize: number;
  } {
    try {
      const latestData = localStorage.getItem(this.LATEST_DATA_KEY);
      const historyData = localStorage.getItem(this.HISTORY_DATA_KEY);
      
      const latestSize = latestData ? new Blob([latestData]).size : 0;
      const historySize = historyData ? new Blob([historyData]).size : 0;
      const historyCount = historyData ? JSON.parse(historyData).length : 0;

      return {
        hasLatestData: !!latestData,
        historyCount,
        totalStorageSize: latestSize + historySize,
        latestDataSize: latestSize,
      };
    } catch (error) {
      console.error('❌ [BrowserHtmlStorage] Failed to get storage stats:', error);
      return {
        hasLatestData: false,
        historyCount: 0,
        totalStorageSize: 0,
        latestDataSize: 0,
      };
    }
  }

  /**
   * Debug method to show stored data
   */
  debugStoredData(): void {
    console.group('🔍 [BrowserHtmlStorage] Debug Info');
    
    const stats = this.getStorageStats();
    console.log('📊 Storage Stats:', stats);
    
    const latest = this.getLatestData();
    if (latest) {
      console.log('📄 Latest Data:', {
        url: latest.metadata.url,
        title: latest.metadata.title,
        extractedAt: latest.metadata.extractedAt,
        contentSummary: {
          headings: latest.content.headings.length,
          paragraphs: latest.content.paragraphs.length,
          textLength: latest.content.text.length,
          images: latest.media.images.length,
          links: latest.links.internal.length + latest.links.external.length
        }
      });
    } else {
      console.log('❌ No latest data found');
    }
    
    const history = this.getHistory();
    console.log('📚 History:', history.map(item => ({
      url: item.metadata.url,
      title: item.metadata.title,
      extractedAt: item.metadata.extractedAt
    })));
    
    console.groupEnd();
  }
}

// Singleton instance
export const browserHtmlStorage = new BrowserHtmlStorage();

// Export for global access
declare global {
  interface Window {
    browserHtmlStorage: BrowserHtmlStorage;
  }
}

if (typeof window !== 'undefined') {
  window.browserHtmlStorage = browserHtmlStorage;
}
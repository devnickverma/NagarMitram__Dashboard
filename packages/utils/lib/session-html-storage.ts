/**
 * Session HTML Storage Utility
 * 
 * @description
 * Client-side utility for accessing HTML data stored in browser sessionStorage.
 * Replaces the previous server-side file-based storage system.
 * 
 * @features
 * - Access latest HTML data from any trigger type
 * - Retrieve specific trigger data (initial-load, final-load, agent-request)
 * - List all available HTML data entries
 * - Type-safe data access with error handling
 * - Storage cleanup and management utilities
 */

export interface IHtmlMetadata {
  title: string;
  description: string;
  url: string;
  extractedAt: string;
}

export interface IHtmlContent {
  headings: string[];
  paragraphs: string[];
  text: string;
}

export interface IHtmlLinks {
  internal: string[];
  external: string[];
}

export interface IHtmlMedia {
  images: string[];
  videos: string[];
}

export interface IProcessedHtmlDataStorage {
  id: string;
  sessionId: string;
  tags: string[];
  timestamp: number;
  captureContext: string;
  trigger: string;
  metadata: IHtmlMetadata;
  content: IHtmlContent;
  links: IHtmlLinks;
  media: IHtmlMedia;
}

export class SessionHtmlStorage {
  private static readonly STORAGE_PREFIX = 'ashi_html_data_';
  private static readonly LATEST_KEY = 'ashi_latest_html_data';

  /**
   * Get the latest HTML data from any trigger type
   */
  static getLatestHtmlData(): IProcessedHtmlDataStorage | null {
    try {
      const latestKey = sessionStorage.getItem(this.LATEST_KEY);
      if (!latestKey) {
        console.warn('⚠️ [SessionHtmlStorage] No latest HTML data reference found');
        return null;
      }

      const dataStr = sessionStorage.getItem(latestKey);
      if (!dataStr) {
        console.warn(`⚠️ [SessionHtmlStorage] No data found for key: ${latestKey}`);
        return null;
      }

      const data = JSON.parse(dataStr) as IProcessedHtmlDataStorage;
      console.log(`📖 [SessionHtmlStorage] Retrieved latest HTML data: ${data.trigger} from ${data.metadata.url}`);
      return data;
    } catch (error) {
      console.error('❌ [SessionHtmlStorage] Failed to get latest HTML data:', error);
      return null;
    }
  }

  /**
   * Get HTML data for a specific trigger type
   */
  static getHtmlDataByTrigger(trigger: string): IProcessedHtmlDataStorage | null {
    try {
      const key = `${this.STORAGE_PREFIX}${trigger}`;
      const dataStr = sessionStorage.getItem(key);
      
      if (!dataStr) {
        console.warn(`⚠️ [SessionHtmlStorage] No data found for trigger: ${trigger}`);
        return null;
      }

      const data = JSON.parse(dataStr) as IProcessedHtmlDataStorage;
      console.log(`📖 [SessionHtmlStorage] Retrieved HTML data for trigger: ${trigger} from ${data.metadata.url}`);
      return data;
    } catch (error) {
      console.error(`❌ [SessionHtmlStorage] Failed to get HTML data for trigger ${trigger}:`, error);
      return null;
    }
  }

  /**
   * Get all available HTML data entries
   */
  static getAllHtmlData(): { trigger: string; data: IProcessedHtmlDataStorage }[] {
    try {
      const entries: { trigger: string; data: IProcessedHtmlDataStorage }[] = [];
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(this.STORAGE_PREFIX) && key !== this.LATEST_KEY) {
          const dataStr = sessionStorage.getItem(key);
          if (dataStr) {
            try {
              const data = JSON.parse(dataStr) as IProcessedHtmlDataStorage;
              const trigger = key.replace(this.STORAGE_PREFIX, '');
              entries.push({ trigger, data });
            } catch (parseError) {
              console.warn(`⚠️ [SessionHtmlStorage] Failed to parse data for key: ${key}`, parseError);
            }
          }
        }
      }

      console.log(`📊 [SessionHtmlStorage] Retrieved ${entries.length} HTML data entries`);
      return entries;
    } catch (error) {
      console.error('❌ [SessionHtmlStorage] Failed to get all HTML data:', error);
      return [];
    }
  }

  /**
   * Check if HTML data exists for a specific trigger
   */
  static hasHtmlData(trigger: string): boolean {
    const key = `${this.STORAGE_PREFIX}${trigger}`;
    return sessionStorage.getItem(key) !== null;
  }

  /**
   * Get available trigger types
   */
  static getAvailableTriggers(): string[] {
    const triggers: string[] = [];
    
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.STORAGE_PREFIX) && key !== this.LATEST_KEY) {
        const trigger = key.replace(this.STORAGE_PREFIX, '');
        triggers.push(trigger);
      }
    }

    return triggers;
  }

  /**
   * Clean up old HTML data entries (useful for memory management)
   */
  static cleanup(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(this.STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
      });

      // Also remove the latest reference
      sessionStorage.removeItem(this.LATEST_KEY);

      console.log(`🧹 [SessionHtmlStorage] Cleaned up ${keysToRemove.length} HTML data entries`);
    } catch (error) {
      console.error('❌ [SessionHtmlStorage] Failed to cleanup HTML data:', error);
    }
  }

  /**
   * Get storage statistics
   */
  static getStorageStats(): {
    totalEntries: number;
    availableTriggers: string[];
    totalStorageSize: number;
    latestTrigger: string | null;
  } {
    const triggers = this.getAvailableTriggers();
    let totalSize = 0;

    triggers.forEach(trigger => {
      const key = `${this.STORAGE_PREFIX}${trigger}`;
      const data = sessionStorage.getItem(key);
      if (data) {
        totalSize += data.length;
      }
    });

    const latestKey = sessionStorage.getItem(this.LATEST_KEY);
    const latestTrigger = latestKey ? latestKey.replace(this.STORAGE_PREFIX, '') : null;

    return {
      totalEntries: triggers.length,
      availableTriggers: triggers,
      totalStorageSize: totalSize,
      latestTrigger
    };
  }
}

// Convenience functions for easy access
export const getLatestHtmlData = () => SessionHtmlStorage.getLatestHtmlData();
export const getHtmlDataByTrigger = (trigger: string) => SessionHtmlStorage.getHtmlDataByTrigger(trigger);
export const getAllHtmlData = () => SessionHtmlStorage.getAllHtmlData();
export const hasHtmlData = (trigger: string) => SessionHtmlStorage.hasHtmlData(trigger);
export const getAvailableTriggers = () => SessionHtmlStorage.getAvailableTriggers();
export const cleanupHtmlData = () => SessionHtmlStorage.cleanup();
export const getHtmlStorageStats = () => SessionHtmlStorage.getStorageStats();
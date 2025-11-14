/**
 * HTML Data Processing Utilities
 * 
 * @description
 * Reusable functions for processing raw HTML into structured data.
 * Can be used in APIs, background jobs, or direct function calls.
 * 
 * @features
 * - HTML parsing and data extraction
 * - Structured data generation
 * - Error handling and validation
 * - Performance monitoring
 * 
 * @author CSR Agent Team  
 * @since 1.0.0
 */

export interface IHtmlProcessingOptions {
  extractImages?: boolean;
  extractLinks?: boolean;
  extractHeadings?: boolean;
  maxTextLength?: number;
  includeMetadata?: boolean;
}

export interface IExtractedHtmlData {
  metadata: {
    title: string;
    description: string;
    url: string;
    extractedAt: string;
    keywords?: string;
    author?: string;
    canonical?: string;
  };
  content: {
    headings: Array<{ level: number; text: string }>;
    paragraphs: string[];
    text: string;
    lists?: string[];
  };
  links: {
    internal: Array<{ url: string; text: string }>;
    external: Array<{ url: string; text: string }>;
  };
  media: {
    images: Array<{ src: string; alt: string; title?: string }>;
    videos: Array<{ src: string; title?: string }>;
  };
}

export interface IProcessedHtmlResult {
  success: boolean;
  data?: {
    id: string;
    sessionId: string;
    tags: string[];
    timestamp: number;
    captureContext: string;
    trigger: string;
    extractedData: IExtractedHtmlData;
    originalHtmlSize: number;
    url: string;
  };
  error?: {
    message: string;
    details: string;
  };
  storageKey?: string;
  processingStats?: {
    extractionTimeMs: number;
    dataSize: number;
    elementsFound: number;
  };
}

/**
 * Simple HTML data extractor class
 * Handles basic HTML parsing without external dependencies
 */
class SimpleHtmlDataExtractor {
  private static instance: SimpleHtmlDataExtractor;

  static getInstance(): SimpleHtmlDataExtractor {
    if (!SimpleHtmlDataExtractor.instance) {
      SimpleHtmlDataExtractor.instance = new SimpleHtmlDataExtractor();
    }
    return SimpleHtmlDataExtractor.instance;
  }

  /**
   * Extract structured data from raw HTML
   */
  extractData(html: string, url: string, options: IHtmlProcessingOptions = {}): IExtractedHtmlData {
    const {
      extractImages = true,
      extractLinks = true,
      extractHeadings = true,
      maxTextLength = 5000,
      includeMetadata = true
    } = options;

    const extractedData: IExtractedHtmlData = {
      metadata: this.extractMetadata(html, url, includeMetadata),
      content: this.extractContent(html, extractHeadings, maxTextLength),
      links: extractLinks ? this.extractLinks(html, url) : { internal: [], external: [] },
      media: extractImages ? this.extractMedia(html) : { images: [], videos: [] }
    };

    return extractedData;
  }

  private extractMetadata(html: string, url: string, includeMetadata: boolean) {
    if (!includeMetadata) {
      return {
        title: '',
        description: '',
        url: url,
        extractedAt: new Date().toISOString()
      };
    }

    // Extract basic metadata
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
    const authorMatch = html.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i);
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);

    return {
      title: titleMatch ? titleMatch[1].trim() : 'Untitled',
      description: descriptionMatch ? descriptionMatch[1].trim() : '',
      url: url,
      extractedAt: new Date().toISOString(),
      keywords: keywordsMatch ? keywordsMatch[1].trim() : undefined,
      author: authorMatch ? authorMatch[1].trim() : undefined,
      canonical: canonicalMatch ? canonicalMatch[1].trim() : undefined,
    };
  }

  private extractContent(html: string, extractHeadings: boolean, maxTextLength: number) {
    const content = {
      headings: [] as Array<{ level: number; text: string }>,
      paragraphs: [] as string[],
      text: '',
      lists: [] as string[]
    };

    if (extractHeadings) {
      // Extract headings (h1-h6)
      const headingMatches = html.match(/<h([1-6])[^>]*>([^<]+)<\/h[1-6]>/gi);
      if (headingMatches) {
        content.headings = headingMatches.map(heading => {
          const levelMatch = heading.match(/<h([1-6])/i);
          const textMatch = heading.match(/>([^<]+)</);
          return {
            level: levelMatch ? parseInt(levelMatch[1]) : 1,
            text: textMatch ? textMatch[1].trim() : ''
          };
        });
      }
    }

    // Extract paragraphs
    const paragraphMatches = html.match(/<p[^>]*>([^<]+)<\/p>/gi);
    if (paragraphMatches) {
      content.paragraphs = paragraphMatches
        .map(p => p.replace(/<[^>]*>/g, '').trim())
        .filter(p => p.length > 0);
    }

    // Extract list items
    const listMatches = html.match(/<li[^>]*>([^<]+)<\/li>/gi);
    if (listMatches) {
      content.lists = listMatches
        .map(li => li.replace(/<[^>]*>/g, '').trim())
        .filter(li => li.length > 0);
    }

    // Extract clean text (remove all HTML tags)
    content.text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')   // Remove styles
      .replace(/<[^>]*>/g, ' ')                          // Remove HTML tags
      .replace(/\s+/g, ' ')                              // Normalize whitespace
      .trim()
      .substring(0, maxTextLength);

    return content;
  }

  private extractLinks(html: string, baseUrl: string) {
    const links = {
      internal: [] as Array<{ url: string; text: string }>,
      external: [] as Array<{ url: string; text: string }>
    };

    const linkMatches = html.match(/<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi);
    if (linkMatches) {
      const baseDomain = new URL(baseUrl).hostname;
      
      linkMatches.forEach(linkHtml => {
        const hrefMatch = linkHtml.match(/href=["']([^"']+)["']/i);
        const textMatch = linkHtml.match(/>([^<]*)</);
        
        if (hrefMatch) {
          const url = hrefMatch[1];
          const text = textMatch ? textMatch[1].trim() : '';
          
          try {
            const linkUrl = new URL(url, baseUrl);
            const linkData = { url: linkUrl.href, text };
            
            if (linkUrl.hostname === baseDomain) {
              links.internal.push(linkData);
            } else {
              links.external.push(linkData);
            }
          } catch (e) {
            // Invalid URL, skip
          }
        }
      });
    }

    return links;
  }

  private extractMedia(html: string) {
    const media = {
      images: [] as Array<{ src: string; alt: string; title?: string }>,
      videos: [] as Array<{ src: string; title?: string }>
    };

    // Extract images
    const imageMatches = html.match(/<img[^>]*>/gi);
    if (imageMatches) {
      imageMatches.forEach(imgHtml => {
        const srcMatch = imgHtml.match(/src=["']([^"']+)["']/i);
        const altMatch = imgHtml.match(/alt=["']([^"']*)["']/i);
        const titleMatch = imgHtml.match(/title=["']([^"']*)["']/i);
        
        if (srcMatch) {
          media.images.push({
            src: srcMatch[1],
            alt: altMatch ? altMatch[1] : '',
            title: titleMatch ? titleMatch[1] : undefined
          });
        }
      });
    }

    // Extract videos
    const videoMatches = html.match(/<video[^>]*>/gi);
    if (videoMatches) {
      videoMatches.forEach(videoHtml => {
        const srcMatch = videoHtml.match(/src=["']([^"']+)["']/i);
        const titleMatch = videoHtml.match(/title=["']([^"']*)["']/i);
        
        if (srcMatch) {
          media.videos.push({
            src: srcMatch[1],
            title: titleMatch ? titleMatch[1] : undefined
          });
        }
      });
    }

    return media;
  }
}

/**
 * Process HTML data from host website payload
 * 
 * @param htmlPayload - Raw HTML data payload from host website
 * @param options - Processing options
 * @returns Processed HTML result
 */
export function processHtmlData(
  htmlPayload: {
    html?: string;
    url?: string;
    trigger?: string;
    captureContext?: string;
    timestamp?: string;
    extractedAt?: number;
  },
  options: IHtmlProcessingOptions = {}
): IProcessedHtmlResult {
  const startTime = performance.now();

  try {
    // Validate input
    const rawHtml = htmlPayload.html || '';
    const url = htmlPayload.url || '';
    const trigger = htmlPayload.trigger || 'unknown';
    const captureContext = htmlPayload.captureContext || 'unknown';

    if (!rawHtml || !url) {
      return {
        success: false,
        error: {
          message: 'Invalid input data',
          details: 'Both html and url are required'
        }
      };
    }

    // Process HTML using extractor
    const htmlExtractor = SimpleHtmlDataExtractor.getInstance();
    const extractedData = htmlExtractor.extractData(rawHtml, url, options);

    // Create processed data structure
    const processedData = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      sessionId: 'auto-session',
      tags: ['auto-fetched', 'host-website'],
      timestamp: Date.now(),
      captureContext,
      trigger,
      extractedData,
      originalHtmlSize: rawHtml.length,
      url
    };

    // Generate storage key for client-side storage
    const storageKey = `ashi_html_data_${trigger}`;

    const endTime = performance.now();
    const processingTimeMs = endTime - startTime;

    console.log(`✅ [processHtmlData] HTML data processed successfully for: ${url} (${rawHtml.length} chars, trigger: ${trigger}, ${processingTimeMs.toFixed(2)}ms)`);

    return {
      success: true,
      data: processedData,
      storageKey,
      processingStats: {
        extractionTimeMs: processingTimeMs,
        dataSize: JSON.stringify(processedData).length,
        elementsFound: extractedData.content.headings.length + extractedData.content.paragraphs.length + extractedData.links.internal.length + extractedData.links.external.length
      }
    };

  } catch (error) {
    const endTime = performance.now();
    const processingTimeMs = endTime - startTime;

    console.error('❌ [processHtmlData] Failed to process HTML data:', error);
    
    return {
      success: false,
      error: {
        message: 'Failed to process HTML data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      processingStats: {
        extractionTimeMs: processingTimeMs,
        dataSize: 0,
        elementsFound: 0
      }
    };
  }
}

/**
 * Quick HTML processing for simple use cases
 * 
 * @param html - Raw HTML string
 * @param url - Source URL
 * @returns Extracted data or null if failed
 */
export function quickExtractHtmlData(html: string, url: string): IExtractedHtmlData | null {
  try {
    const extractor = SimpleHtmlDataExtractor.getInstance();
    return extractor.extractData(html, url);
  } catch (error) {
    console.error('❌ [quickExtractHtmlData] Failed:', error);
    return null;
  }
}

/**
 * Generate storage key for HTML data
 * 
 * @param trigger - What triggered the HTML capture
 * @param sessionId - Optional session ID
 * @returns Storage key string
 */
export function generateHtmlStorageKey(trigger: string, sessionId?: string): string {
  if (sessionId) {
    return `ashi_html_data_${trigger}_${sessionId}`;
  }
  return `ashi_html_data_${trigger}`;
}
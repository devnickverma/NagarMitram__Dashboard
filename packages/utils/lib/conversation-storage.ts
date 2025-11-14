/**
 * Conversation Storage System
 * Handles persistent storage of conversations using localStorage with fallback
 */

import { IChatMessage } from '../chat-interface-types/message.types';

export interface IConversation {
  id: string;
  sessionId: string;
  userId?: string;
  title: string;
  messages: IChatMessage[];
  createdAt: string;
  updatedAt: string;
  metadata: {
    messageCount: number;
    lastMessageType: string;
    tags: string[];
  };
}

export interface IConversationSummary {
  id: string;
  title: string;
  lastMessage: string;
  messageCount: number;
  updatedAt: string;
  tags: string[];
}

class ConversationStorage {
  private readonly STORAGE_KEY = 'ashi_widget_conversations';
  private readonly SESSION_STORAGE_KEY = 'ashi_widget_current_conversations';
  private readonly MAX_CONVERSATIONS = 50; // Limit to prevent localStorage overflow
  private readonly MAX_MESSAGES_PER_CONVERSATION = 1000;

  constructor() {
    // Only initialize storage on client-side
    if (typeof window !== 'undefined') {
      this.initializeStorage();
    }
  }

  private initializeStorage(): void {
    try {
      // Check if storage is available before using it
      if (!this.isStorageAvailable()) {
        console.warn('localStorage is not available');
        return;
      }

      // Initialize localStorage
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({}));
      }
      
      // Initialize sessionStorage
      const sessionStored = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
      if (!sessionStored) {
        sessionStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify({}));
      }
    } catch (error) {
      console.warn('Failed to initialize conversation storage:', error);
    }
  }

  private isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private getStoredConversations(): Record<string, IConversation> {
    try {
      if (!this.isStorageAvailable()) return {};
      
      // First try sessionStorage (current session conversations)
      const sessionStored = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
      if (sessionStored) {
        const sessionConversations = JSON.parse(sessionStored);
        if (Object.keys(sessionConversations).length > 0) {
          return sessionConversations;
        }
      }
      
      // Fallback to localStorage (persistent conversations)
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to read conversations from storage:', error);
      return {};
    }
  }

  private saveConversations(conversations: Record<string, IConversation>): boolean {
    try {
      if (!this.isStorageAvailable()) return false;
      
      // Cleanup old conversations if we exceed the limit
      const conversationArray = Object.values(conversations);
      if (conversationArray.length > this.MAX_CONVERSATIONS) {
        // Sort by updatedAt and keep only the most recent
        conversationArray.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        const keepConversations = conversationArray.slice(0, this.MAX_CONVERSATIONS);
        conversations = keepConversations.reduce((acc, conv) => {
          acc[conv.id] = conv;
          return acc;
        }, {} as Record<string, IConversation>);
      }

      // Save to both sessionStorage (for refresh persistence) and localStorage (for long-term)
      sessionStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(conversations));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(conversations));
      return true;
    } catch (error) {
      console.error('Failed to save conversations to storage:', error);
      return false;
    }
  }

  /**
   * Create a new conversation
   */
  createConversation(sessionId: string, userId?: string, title?: string): IConversation {
    const now = new Date().toISOString();
    const conversation: IConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      userId,
      title: title || `Conversation ${new Date().toLocaleDateString()}`,
      messages: [],
      createdAt: now,
      updatedAt: now,
      metadata: {
        messageCount: 0,
        lastMessageType: '',
        tags: []
      }
    };

    const conversations = this.getStoredConversations();
    conversations[conversation.id] = conversation;
    this.saveConversations(conversations);

    return conversation;
  }

  /**
   * Get a conversation by ID
   */
  getConversation(conversationId: string): IConversation | null {
    const conversations = this.getStoredConversations();
    return conversations[conversationId] || null;
  }

  /**
   * Get all conversations for a session
   */
  getConversationsBySession(sessionId: string): IConversation[] {
    const conversations = this.getStoredConversations();
    return Object.values(conversations)
      .filter(conv => conv.sessionId === sessionId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * Get conversation summaries for listing
   */
  getConversationSummaries(sessionId?: string): IConversationSummary[] {
    const conversations = this.getStoredConversations();
    let conversationList = Object.values(conversations);

    if (sessionId) {
      conversationList = conversationList.filter(conv => conv.sessionId === sessionId);
    }

    return conversationList
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .map(conv => ({
        id: conv.id,
        title: conv.title,
        lastMessage: conv.messages.length > 0 
          ? conv.messages[conv.messages.length - 1].content.slice(0, 100) + '...'
          : 'No messages yet',
        messageCount: conv.metadata.messageCount,
        updatedAt: conv.updatedAt,
        tags: conv.metadata.tags
      }));
  }

  /**
   * Add a message to a conversation
   */
  addMessage(conversationId: string, message: IChatMessage): boolean {
    const conversations = this.getStoredConversations();
    const conversation = conversations[conversationId];

    if (!conversation) {
      console.error(`Conversation ${conversationId} not found`);
      return false;
    }

    // Limit messages per conversation
    if (conversation.messages.length >= this.MAX_MESSAGES_PER_CONVERSATION) {
      // Remove oldest messages to make room
      conversation.messages = conversation.messages.slice(-this.MAX_MESSAGES_PER_CONVERSATION + 1);
    }

    conversation.messages.push(message);
    conversation.updatedAt = new Date().toISOString();
    conversation.metadata.messageCount = conversation.messages.length;
    conversation.metadata.lastMessageType = message.type;

    // Auto-update title if it's the default and we have messages
    if (conversation.title.startsWith('Conversation ') && conversation.messages.length === 2) {
      // Use first user message as title (usually the second message after welcome)
      const firstUserMessage = conversation.messages.find(m => m.type === 'user');
      if (firstUserMessage) {
        conversation.title = firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
      }
    }

    return this.saveConversations(conversations);
  }

  /**
   * Update conversation metadata
   */
  updateConversation(conversationId: string, updates: Partial<IConversation>): boolean {
    const conversations = this.getStoredConversations();
    const conversation = conversations[conversationId];

    if (!conversation) {
      return false;
    }

    Object.assign(conversation, updates, {
      updatedAt: new Date().toISOString()
    });

    return this.saveConversations(conversations);
  }

  /**
   * Delete a conversation
   */
  deleteConversation(conversationId: string): boolean {
    const conversations = this.getStoredConversations();
    
    if (!conversations[conversationId]) {
      return false;
    }

    delete conversations[conversationId];
    return this.saveConversations(conversations);
  }

  /**
   * Search messages across conversations
   */
  searchMessages(query: string, sessionId?: string): Array<{
    conversationId: string;
    conversationTitle: string;
    message: IChatMessage;
    matchScore: number;
  }> {
    const conversations = this.getStoredConversations();
    const results: Array<{
      conversationId: string;
      conversationTitle: string;
      message: IChatMessage;
      matchScore: number;
    }> = [];

    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return results;

    Object.values(conversations).forEach(conversation => {
      if (sessionId && conversation.sessionId !== sessionId) return;

      conversation.messages.forEach(message => {
        const content = message.content.toLowerCase();
        if (content.includes(searchTerm)) {
          // Simple scoring based on how well the term matches
          const exactMatch = content === searchTerm;
          const startsWith = content.startsWith(searchTerm);
          const wordMatch = content.split(' ').includes(searchTerm);
          
          let matchScore = 1;
          if (exactMatch) matchScore = 10;
          else if (startsWith) matchScore = 7;
          else if (wordMatch) matchScore = 5;
          else matchScore = 2;

          results.push({
            conversationId: conversation.id,
            conversationTitle: conversation.title,
            message,
            matchScore
          });
        }
      });
    });

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Export conversation data
   */
  exportConversation(conversationId: string): string | null {
    const conversation = this.getConversation(conversationId);
    if (!conversation) return null;

    return JSON.stringify(conversation, null, 2);
  }

  /**
   * Import conversation data
   */
  importConversation(conversationData: string): boolean {
    try {
      const conversation: IConversation = JSON.parse(conversationData);
      
      // Validate the conversation structure
      if (!conversation.id || !conversation.sessionId || !Array.isArray(conversation.messages)) {
        throw new Error('Invalid conversation format');
      }

      const conversations = this.getStoredConversations();
      conversations[conversation.id] = conversation;
      
      return this.saveConversations(conversations);
    } catch (error) {
      console.error('Failed to import conversation:', error);
      return false;
    }
  }

  /**
   * Clear all conversations for a session
   */
  clearSession(sessionId: string): boolean {
    const conversations = this.getStoredConversations();
    
    Object.keys(conversations).forEach(id => {
      if (conversations[id].sessionId === sessionId) {
        delete conversations[id];
      }
    });

    return this.saveConversations(conversations);
  }

  /**
   * Get storage stats
   */
  getStorageStats(): {
    totalConversations: number;
    totalMessages: number;
    storageSize: number;
    isStorageAvailable: boolean;
  } {
    const conversations = this.getStoredConversations();
    const totalMessages = Object.values(conversations).reduce(
      (sum, conv) => sum + conv.messages.length, 
      0
    );

    let storageSize = 0;
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      storageSize = stored ? new Blob([stored]).size : 0;
    } catch {
      storageSize = 0;
    }

    return {
      totalConversations: Object.keys(conversations).length,
      totalMessages,
      storageSize,
      isStorageAvailable: this.isStorageAvailable()
    };
  }
}

// Singleton instance
export const conversationStorage = new ConversationStorage();
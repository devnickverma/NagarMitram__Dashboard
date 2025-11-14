/**
 * Missing exports from @de/frontends-sdk that need local implementation
 * This file provides fallback implementations for functionality not available in the current SDK
 */

// ChatCommandProcessor - Simple mock implementation
export class ChatCommandProcessor {
  constructor(
    private addBotMessage: (message: string) => void,
    private executeAction: (action: string, params?: any) => void
  ) {}

  async initialize(): Promise<void> {
    // Initialize command processor
  }

  async processMessage(message: string): Promise<{ success: boolean }> {
    // Simple command processing
    if (message.startsWith('/help')) {
      this.addBotMessage('Available commands: /help, /status, /clear');
      return { success: true };
    }
    
    if (message.startsWith('/status')) {
      this.addBotMessage('System status: Online');
      return { success: true };
    }
    
    if (message.startsWith('/clear')) {
      this.addBotMessage('Chat cleared');
      return { success: true };
    }
    
    return { success: false };
  }
}

// TMessageType - Message type definitions
export type TMessageType = 
  | 'text' 
  | 'file' 
  | 'image' 
  | 'system' 
  | 'typing' 
  | 'user'
  | 'bot'
  | 'suggestion'
  | 'suggestion-outlined'
  | 'category-cards'
  | 'user-image'
  | 'product-suggestions'
  | 'order-cards';

// IChatConfig - Chat configuration interface
export interface IChatConfig {
  brandName: string;
  brandColor: string;
  brandIcon?: string;
  poweredByText?: string;
  poweredByIcon?: string;
  [key: string]: unknown;
}

// Export functions that might be used by command processor
export const convertRelativeToAbsolute = (url: string, baseUrl: string): string => {
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
};

export const navigateToUrl = (url: string): void => {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
};

export const executeWebsiteAction = (action: string, params?: any): void => {
  console.log('Website action:', action, params);
  // In a real implementation, this would interact with the host website
};

// Website action types
export type TWebsiteActionType = 
  | 'CLICK_TEXT'
  | 'ADD_TO_CART'
  | 'BUY_NOW'
  | 'TRY_ON'
  | 'ADD_TO_WISHLIST'
  | 'NAVIGATE_BACK'
  | 'NAVIGATE_FORWARD'
  | 'REFRESH_PAGE'
  | 'SCROLL_TO_SECTION';

// Action parameters interface
export interface IActionParams {
  [key: string]: any;
}

// Chat message interface
export interface ISdkChatMessage {
  id: string;
  content: string;
  type: TMessageType;
  timestamp: Date;
  sender?: {
    id: string;
    name: string;
    type: 'user' | 'bot' | 'system';
  };
}

// Process functions - simplified implementations
export const processSlashCommand = (params: {
  command: string;
  userMessage: string;
  getAllLinks: () => any[];
  clearLinks: () => void;
  addBotMessage: (message: string) => void;
  pageData: any;
  sessionContext: unknown;
  convertRelativeToAbsolute: (url: string, base: string) => string;
  navigateToUrl: (url: string) => void;
}): boolean => {
  const { command, addBotMessage } = params;
  
  switch (command) {
    case 'help':
      addBotMessage('Available commands: /help, /status, /links, /clear');
      return true;
    case 'status':
      addBotMessage('System status: Online and ready');
      return true;
    case 'links':
      const links = params.getAllLinks();
      addBotMessage(`Found ${links.length} links on this page`);
      return true;
    case 'clear':
      params.clearLinks();
      addBotMessage('Links cleared');
      return true;
    default:
      return false;
  }
};

export const processDataCommand = (message: string, addBotMessage: (msg: string) => void): boolean => {
  if (message.toLowerCase().includes('data')) {
    addBotMessage('Data processing functionality coming soon!');
    return true;
  }
  return false;
};

export const processNavigation = (params: {
  userMessage: string;
  getAllLinks: () => any[];
  addBotMessage: (message: string) => void;
  pageData: any;
  sessionContext: unknown;
  convertRelativeToAbsolute: (url: string, base: string) => string;
  navigateToUrl: (url: string) => void;
}): boolean => {
  const { userMessage, addBotMessage, navigateToUrl: _navigateToUrl } = params;
  
  // Simple navigation detection
  if (userMessage.toLowerCase().includes('go to') || userMessage.toLowerCase().includes('navigate')) {
    addBotMessage('Navigation functionality coming soon!');
    return true;
  }
  
  return false;
};

// Hook implementations - simplified
export const useChatInputManager = () => ({
  setInputValue: (value: string) => console.log('Set input:', value),
  setShowConversationStarters: (show: boolean) => console.log('Show starters:', show),
  setIsLoading: (loading: boolean) => console.log('Set loading:', loading),
});

export const useSessionManager = () => ({
  sessionContext: {},
  pageData: {},
});

export const useLinks = () => ({
  getAllLinks: () => [],
  clearLinks: () => {},
});

export const useChatStateManager = () => ({
  content: {
    welcomeMessage: 'Welcome! How can I help you today?',
  },
  behavior: {
    enableAttachments: true,
    enableImagePreview: true,
  },
});

export const useMessageHandlers = (setMessages: (updater: (prev: any[]) => any[]) => void) => ({
  addBotMessage: (content: string, options?: any) => {
    const message = {
      id: Date.now().toString(),
      content,
      type: 'bot' as TMessageType,
      timestamp: new Date(),
      ...options,
    };
    setMessages(prev => [...prev, message]);
  },
  addUserMessage: (content: string) => {
    const message = {
      id: Date.now().toString(),
      content,
      type: 'user' as TMessageType,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  },
});
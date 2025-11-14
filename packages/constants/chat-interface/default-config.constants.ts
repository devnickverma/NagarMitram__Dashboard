import { IChatConfiguration } from '@de/utils';

export const DEFAULT_CHAT_CONFIG: IChatConfiguration = {
  theme: {
    backgroundGradient: {
      from: '#151515',
      to: '#FFFFFF',
    },
    chatWindowBackground: '#ffffff',
    headerBackgroundColor: '#2563eb',
    chatButtonColor: '#151518',
  },
  branding: {
    companyName: 'Hi There,',
    botName: 'Chat Assistant',
    tagline: 'Here to help you',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
    },
  },
  dimensions: {
    minWidth: 280,
    minHeight: 400,
    maxWidth: 500,
    maxHeight: 700,
  },
  content: {
    welcomeMessage: 'I am Chat assistant. I am here to help you with whatever you need',
    inputPlaceholder: 'Write your query here...',
    defaultMessages: [],
  },
  behavior: {
    showCloseButton: true,
    showExpandButton: true,
    showColumnsButton: false,
    enableAttachments: true,
    enableImagePreview: true,
    autoScroll: true,
  },
} as const;

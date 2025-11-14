export const CLASSES = {
  CONTAINER:
    'fixed bottom-4 sm:bottom-6 md:bottom-10 lg:bottom-12 right-4 sm:right-6 md:right-10 lg:right-12',
  INTERFACE: 'animate-in slide-in-from-bottom-4 fade-in duration-300 z-50',
  CHAT_BAR_ACTIVE: 'transition-transform duration-300 scale-95 opacity-75',
  CHAT_BAR_IDLE: 'transition-transform duration-300 scale-100 opacity-100',
} as const;

export const VIEW_MODES = {
  IDLE: 'idle',
  CHAT: 'chat',
  CALL: 'call',
} as const;

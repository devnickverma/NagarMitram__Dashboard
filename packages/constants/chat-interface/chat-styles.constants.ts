export const CHAT_SCREEN_STYLES = {
  CONTAINER_BASE: 'flex flex-col shadow-[0px_2px_60px_0px_rgba(0,0,0,0.4)]',
  CONTAINER_EXPANDED:
    'resize overflow-auto w-[700px] h-[750px] max-w-[min(90vw,800px)] max-h-[min(85vh,750px)] min-w-[500px] min-h-[600px]',
  CONTAINER_COMPACT:
    'w-full max-w-[min(90vw,500px)] sm:max-w-[min(85vw,500px)] md:max-w-[min(80vw,500px)] lg:max-w-[min(75vw,500px)] xl:max-w-[min(70vw,500px)] 2xl:max-w-[500px] h-[min(90vh,600px)] sm:h-[min(85vh,750px)] md:h-[min(80vh,750px)] lg:h-[750px] max-h-[750px] min-w-[500px] min-h-[600px]',
  CONTAINER_PADDING: 'p-1 sm:p-1.5 md:p-2 rounded-xl sm:rounded-2xl md:rounded-[20px]',

  // Draggable window styles
  DRAGGABLE_WINDOW_CONTAINER:
    'fixed border border-gray-300 shadow-2xl rounded-lg overflow-hidden bg-white z-[9999]',
  DRAGGABLE_HEADER:
    'flex items-center justify-between bg-gray-100 p-2 cursor-move select-none border-b border-gray-200',
  DRAGGABLE_TITLE: 'flex items-center gap-2 text-sm font-medium text-gray-700',
  DRAGGABLE_CONTROLS: 'flex items-center gap-1',
  DRAGGABLE_CONTENT: 'flex flex-col h-full bg-white',

  CHAT_AREA: 'flex-1 flex flex-col min-h-0',
  CHAT_WINDOW: 'flex-1 flex flex-col min-h-0 rounded-xl sm:rounded-xl md:rounded-[15px] ',

  MESSAGES_CONTAINER: 'flex-1 flex flex-col min-h-0 relative',
  MESSAGES_SCROLLABLE:
    'flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100',

  WELCOME_MESSAGE_CONTAINER:
    'absolute top-0 left-0 right-0 z-10 p-1 sm:p-2 transition-all duration-500 ease-out',
  WELCOME_MESSAGE_VISIBLE: 'opacity-100 transform translate-y-0',
  WELCOME_MESSAGE_FADING: 'opacity-0 transform translate-y-[-20px]',

  INPUT_AREA: 'flex-shrink-0 p-1 sm:p-2 pb-0',
  FOOTER_AREA: 'flex-shrink-0 p-0 m-0',
} as const;

export const CHAT_WINDOW_SIZES = {
  COMPACT: { width: 500, height: 600 },
  HORIZONTAL_1: { width: 620, height: 600 }, // First expand horizontally
  VERTICAL_1: { width: 620, height: 750 }, // Then expand vertically (updated max height)
  HORIZONTAL_2: { width: 680, height: 750 }, // Expand horizontally again
  VERTICAL_2: { width: 680, height: 750 }, // Then expand vertically (capped at max height)
  HORIZONTAL_3: { width: 800, height: 750 }, // Final horizontal expansion (updated max width)
} as const;

export type TChatWindowSize = keyof typeof CHAT_WINDOW_SIZES;

export const CHAT_TIMING = {
  WELCOME_FADE_DURATION: 500,
  SCROLL_DELAY: 100,
  WELCOME_PADDING_TOP: '110px',
  DEFAULT_PADDING_TOP: '8px',
} as const;

export const CHAT_SCROLL_BEHAVIOR = {
  BEHAVIOR: 'smooth' as const,
  TRANSITION: 'padding-top 0.5s ease-out',
} as const;

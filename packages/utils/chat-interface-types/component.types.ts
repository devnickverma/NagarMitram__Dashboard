import { HTMLAttributes } from 'react';

import { IChatConfiguration } from './chat-config.types';
import { IChatMessage, IImagePreview, TFeedbackType } from './message.types';

export interface IChatScreenHandlers {
  onClose?: () => void;
  onExpand?: () => void;
  onMinimize?: () => void;
  onColumns?: () => void;
  onSend?: (message: string) => void;
  onAttach?: (files: FileList | null) => void;
  onImageSend?: (imageUrl: string, imageName: string, caption?: string) => void;
  onSuggestionClick?: (content: string) => void;
  onCardClick?: (title: string) => void;
  onProductClick?: (productNumber: string) => void;
  onOrderClick?: (orderId: string) => void;
  onFeedback?: (messageId: string, feedback: TFeedbackType) => void;
}

export interface IChatScreenProps extends HTMLAttributes<HTMLDivElement>, IChatScreenHandlers {
  welcomeMessage?: string;
  messages?: Array<IChatMessage>;
  config?: Partial<IChatConfiguration>;
  isExpanded?: boolean;
  showWelcomeMessage?: boolean;
  backgroundGradient?: {
    from: string;
    to: string;
  };
  padding?: string;
  children?: React.ReactNode;
}

export interface IChatHeaderProps {
  onClose?: () => void;
  tagline?: string;
  logoUrl?: string;
  config?: IChatConfiguration;
  isExpanded?: boolean;
  sizeMode?: string;
}

export interface IChatMessagesAreaProps {
  messages: Array<IChatMessage>;
  onSuggestionClick?: (content: string) => void;
  onCardClick?: (title: string) => void;
  onProductClick?: (productNumber: string) => void;
  onOrderClick?: (orderId: string) => void;
  onFeedback?: (messageId: string, feedback: TFeedbackType) => void;
  isCompactMode?: boolean;
  className?: string;
}


export interface IChatInputAreaProps extends HTMLAttributes<HTMLDivElement> {
  onSend?: (message: string) => void;
  onAttach?: (files: FileList | null) => void;
  onImageSend?: (imageUrl: string, imageName: string, caption?: string) => void;
  placeholder?: string;
  config: Partial<IChatConfiguration>;
  previewImage?: IImagePreview | null;
  onImageCancel?: () => void;
  disabled?: boolean;
}

export interface IWelcomeMessageBannerProps {
  message: string;
  config: IChatConfiguration;
}

export interface IWelcomeMessageProps {
  message: string;
  config: IChatConfiguration;
}

export interface IPoweredByFooterProps {
  config?: IChatConfiguration;
}

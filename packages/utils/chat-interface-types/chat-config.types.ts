export interface IChatTheme {
  backgroundGradient: {
    from: string;
    to: string;
  };
  chatWindowBackground: string;
  headerBackgroundColor?: string;
  chatButtonColor?: string;
}

export interface IChatBranding {
  companyName: string;
  logoUrl?: string;
  botName?: string;
  tagline?: string;
}

export interface IChatTypography {
  fontFamily: string;
  fontSize: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface IChatDimensions {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
}

export interface IChatContent {
  welcomeMessage: string;
  inputPlaceholder: string;
  defaultMessages: Array<string>;
}

export interface IChatBehavior {
  showCloseButton: boolean;
  showExpandButton: boolean;
  showColumnsButton: boolean;
  enableAttachments: boolean;
  enableImagePreview: boolean;
  autoScroll: boolean;
}

export interface IChatConfiguration {
  theme: IChatTheme;
  branding: IChatBranding;
  typography: IChatTypography;
  dimensions: IChatDimensions;
  content: IChatContent;
  behavior: IChatBehavior;
}

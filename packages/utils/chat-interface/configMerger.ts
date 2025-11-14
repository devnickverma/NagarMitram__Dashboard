import { IChatConfiguration } from '../chat-interface-types';
import { DEFAULT_CHAT_CONFIG } from '../constants';

interface IURLHeaderConfig {
  headerBgColor?: string | null;
  botName?: string | null;
  tagline?: string | null;
  gradientFrom?: string | null;
  gradientTo?: string | null;
  chatButtonColor?: string | null;
}

/**
 * Merges URL parameters with default chat configuration
 */
export const mergeUrlConfigWithDefaults = (urlConfig?: IURLHeaderConfig): IChatConfiguration => {
  const config = { ...DEFAULT_CHAT_CONFIG };

  if (urlConfig?.headerBgColor) {
    config.theme.headerBackgroundColor = urlConfig.headerBgColor;
  }

  if (urlConfig?.botName) {
    config.branding.botName = urlConfig.botName;
  }

  if (urlConfig?.tagline) {
    config.branding.tagline = urlConfig.tagline;
  }

  if (urlConfig?.gradientFrom) {
    config.theme.backgroundGradient.from = urlConfig.gradientFrom;
  }

  if (urlConfig?.gradientTo) {
    config.theme.backgroundGradient.to = urlConfig.gradientTo;
  }

  if (urlConfig?.chatButtonColor) {
    config.theme.chatButtonColor = urlConfig.chatButtonColor;
  }

  return config;
};

/**
 * Gets configuration from window.customHeaderConfig if available
 * Only applies custom config when in embedded mode
 */
export const getUrlBasedConfig = (): IChatConfiguration => {
  const isEmbedded =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('embedded') === 'true';

  if (
    isEmbedded &&
    typeof window !== 'undefined' &&
    (window as unknown as { customHeaderConfig?: IURLHeaderConfig }).customHeaderConfig
  ) {
    // eslint-disable-next-line no-console
    //   '🔧 Found window.customHeaderConfig (embedded mode):',
    //   (window as unknown as { customHeaderConfig?: IURLHeaderConfig }).customHeaderConfig
    // );
    const mergedConfig = mergeUrlConfigWithDefaults(
      (window as unknown as { customHeaderConfig?: IURLHeaderConfig }).customHeaderConfig
    );
    // eslint-disable-next-line no-console
    return mergedConfig;
  }
  // eslint-disable-next-line no-console
  return DEFAULT_CHAT_CONFIG;
};

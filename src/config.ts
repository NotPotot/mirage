import type { ShieldConfig, ClientConfig } from './types';

export const DEFAULT_SHIELD_CONFIG: ShieldConfig = {
  routes: {
    '/*': 'standard',
  },
  onDetection: 'block',
  blockPage: '/blocked',
  rateLimit: {
    windowMs: 60_000,
    maxRequests: 60,
    aiPatternMultiplier: 0.5,
  },
  debug: false,
};

export const DEFAULT_CLIENT_CONFIG: ClientConfig = {
  protectSelectors: ['[data-sensitive]'],
  honeypotFields: true,
  behaviorTracking: true,
  proofOfWork: false,
};

export function mergeConfig(
  partial: Partial<ShieldConfig>
): ShieldConfig {
  return {
    ...DEFAULT_SHIELD_CONFIG,
    ...partial,
    rateLimit: {
      ...DEFAULT_SHIELD_CONFIG.rateLimit,
      ...partial.rateLimit,
    },
  };
}

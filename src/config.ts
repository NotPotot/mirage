import type { ShieldConfig, ClientConfig } from './types';

export const DEFAULT_SHIELD_CONFIG: ShieldConfig = {
  enabled: true,
  routes: {
    '/*': 'standard',
  },
  onDetection: 'block',
  blockPage: '/blocked',
  rateLimit: {
    windowMs: 60_000,
    maxRequests: 30,
    aiPatternMultiplier: 0.3,
  },
  debug: false,
};

export const DEFAULT_CLIENT_CONFIG: ClientConfig = {
  protectSelectors: ['[data-sensitive]'],
  honeypotFields: true,
  behaviorTracking: true,
  proofOfWork: false,
};

function resolveEnabled(explicit?: boolean): boolean {
  if (explicit !== undefined) return explicit;
  const env = typeof process !== 'undefined' ? process.env.MIRAGE_ENABLED : undefined;
  if (env === 'false' || env === '0') return false;
  return true;
}

export function mergeConfig(
  partial: Partial<ShieldConfig>
): ShieldConfig {
  return {
    ...DEFAULT_SHIELD_CONFIG,
    ...partial,
    enabled: resolveEnabled(partial.enabled),
    rateLimit: {
      ...DEFAULT_SHIELD_CONFIG.rateLimit,
      ...partial.rateLimit,
    },
  };
}

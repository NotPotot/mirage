export type {
  ShieldConfig,
  ClientConfig,
  ThreatAssessment,
  Signal,
  RequestInfo,
  SensitivityLevel,
  DetectionAction,
  OnDetection,
  RateLimitConfig,
} from './types';

export { DEFAULT_SHIELD_CONFIG, DEFAULT_CLIENT_CONFIG, mergeConfig } from './config';
export { createAssessment, signal } from './shared/scoring';
export { matchesBotPattern, KNOWN_BOT_USER_AGENTS } from './shared/patterns';
export { createLogger } from './shared/logger';
export { scoreRequest } from './server/fingerprint';
export { detectBot } from './server/bot-detection';
export { checkRateLimit, resetRateLimiter } from './server/rate-limiter';
export { generateCSPHeader } from './server/csp';

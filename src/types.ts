export type SensitivityLevel = 'standard' | 'high' | 'maximum';
export type DetectionAction = 'allow' | 'challenge' | 'block';
export type OnDetection = 'block' | 'challenge' | 'monitor';

export interface Signal {
  name: string;
  weight: number;
  value: number;
  evidence: string;
}

export interface ThreatAssessment {
  score: number;
  signals: Signal[];
  action: DetectionAction;
  requestId: string;
  timestamp: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  aiPatternMultiplier: number;
}

export interface ShieldConfig {
  routes: Record<string, SensitivityLevel>;
  onDetection: OnDetection;
  blockPage: string;
  rateLimit: RateLimitConfig;
  debug: boolean;
  eventsUrl?: string;
}

export interface ClientConfig {
  reportEndpoint?: string;
  protectSelectors: string[];
  honeypotFields: boolean;
  behaviorTracking: boolean;
  proofOfWork: boolean;
}

export interface RequestInfo {
  ip: string;
  userAgent: string;
  headers: Record<string, string>;
  method: string;
  url: string;
  timestamp: number;
  body?: string;
}

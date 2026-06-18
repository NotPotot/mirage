import { detectBot } from '../bot-detection';
import { checkRateLimit } from '../rate-limiter';
import { checkRepetition } from '../rate-limiter/repetition-tracker';
import { createAssessment } from '../../shared/scoring';
import type {
  RequestInfo,
  ThreatAssessment,
  RateLimitConfig,
  SensitivityLevel,
} from '../../types';

function generateRequestId(): string {
  return `ch_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function getSensitivityMultiplier(level: SensitivityLevel): number {
  switch (level) {
    case 'maximum':
      return 1.5;
    case 'high':
      return 1.2;
    case 'standard':
      return 1.0;
  }
}

export function scoreRequest(
  request: RequestInfo,
  rateLimitConfig: RateLimitConfig,
  sensitivity: SensitivityLevel = 'standard'
): { assessment: ThreatAssessment; rateLimited: boolean; slowdownMs: number } {
  const requestId = generateRequestId();
  const fingerprint = `${request.ip}|${request.userAgent.slice(0, 50)}`;

  const botSignals = detectBot(request);
  const { allowed, signals: rateSignals } = checkRateLimit(
    fingerprint,
    rateLimitConfig
  );

  const contentType = request.headers['content-type'] || '';
  const { signals: repetitionSignals, slowdownMs } = checkRepetition(
    fingerprint,
    request.method,
    request.url,
    contentType,
    request.body || ''
  );

  const allSignals = [...botSignals, ...rateSignals, ...repetitionSignals];

  const multiplier = getSensitivityMultiplier(sensitivity);
  const amplifiedSignals = allSignals.map((s) => ({
    ...s,
    weight: Math.round(s.weight * multiplier),
  }));

  const assessment = createAssessment(amplifiedSignals, requestId);

  return { assessment, rateLimited: !allowed, slowdownMs };
}

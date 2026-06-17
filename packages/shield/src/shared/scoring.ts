import type { Signal, ThreatAssessment, DetectionAction } from '../types';

const BLOCK_THRESHOLD = 60;
const CHALLENGE_THRESHOLD = 35;

export function createAssessment(
  signals: Signal[],
  requestId: string
): ThreatAssessment {
  const score = Math.min(
    100,
    signals.reduce((sum, s) => sum + s.weight * s.value, 0)
  );

  let action: DetectionAction = 'allow';
  if (score >= BLOCK_THRESHOLD) action = 'block';
  else if (score >= CHALLENGE_THRESHOLD) action = 'challenge';

  return {
    score,
    signals: signals.filter((s) => s.value > 0),
    action,
    requestId,
    timestamp: Date.now(),
  };
}

export function signal(
  name: string,
  weight: number,
  value: number,
  evidence: string
): Signal {
  return { name, weight, value: Math.min(1, Math.max(0, value)), evidence };
}

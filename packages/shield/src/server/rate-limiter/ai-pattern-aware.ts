import { signal } from '../../shared/scoring';
import type { Signal, RateLimitConfig } from '../../types';

interface RequestRecord {
  timestamps: number[];
  intervals: number[];
}

const store = new Map<string, RequestRecord>();

function cleanupStore(windowMs: number) {
  const now = Date.now();
  for (const [key, record] of store) {
    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);
    if (record.timestamps.length === 0) store.delete(key);
  }
}

export function checkRateLimit(
  fingerprint: string,
  config: RateLimitConfig
): { allowed: boolean; signals: Signal[] } {
  const now = Date.now();
  const signals: Signal[] = [];

  if (store.size > 10000) cleanupStore(config.windowMs);

  let record = store.get(fingerprint);
  if (!record) {
    record = { timestamps: [], intervals: [] };
    store.set(fingerprint, record);
  }

  record.timestamps = record.timestamps.filter(
    (t) => now - t < config.windowMs
  );

  if (record.timestamps.length > 0) {
    const lastTimestamp = record.timestamps[record.timestamps.length - 1];
    const interval = now - lastTimestamp;
    record.intervals.push(interval);
    if (record.intervals.length > 20) record.intervals.shift();
  }

  record.timestamps.push(now);

  const count = record.timestamps.length;
  if (count > config.maxRequests) {
    signals.push(
      signal(
        'rate-limit-exceeded',
        25,
        1,
        `${count} requests in ${config.windowMs}ms window (limit: ${config.maxRequests})`
      )
    );
  }

  if (record.intervals.length >= 5) {
    const uniformity = detectUniformTiming(record.intervals);
    if (uniformity > 0.8) {
      signals.push(
        signal(
          'uniform-timing',
          25,
          uniformity,
          `Request timing is ${Math.round(uniformity * 100)}% uniform — likely automated`
        )
      );
    }
  }

  const effectiveMax = signals.length > 0
    ? config.maxRequests * config.aiPatternMultiplier
    : config.maxRequests;

  return {
    allowed: count <= effectiveMax,
    signals,
  };
}

function detectUniformTiming(intervals: number[]): number {
  if (intervals.length < 3) return 0;
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  if (mean === 0) return 1;
  const variance =
    intervals.reduce((sum, i) => sum + Math.pow(i - mean, 2), 0) /
    intervals.length;
  const stdDev = Math.sqrt(variance);
  const coeffOfVariation = stdDev / mean;
  return Math.max(0, 1 - coeffOfVariation);
}

export function resetRateLimiter() {
  store.clear();
}

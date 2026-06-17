import type { Signal, DetectionAction } from '../types';

export interface SecurityEvent {
  id: string;
  timestamp: number;
  ip: string;
  userAgent: string;
  url: string;
  method: string;
  threatScore: number;
  action: DetectionAction;
  signals: Signal[];
  slowdownMs: number;
}

export interface EventStats {
  totalRequests: number;
  blocked: number;
  challenged: number;
  allowed: number;
  topSignals: Array<{ name: string; count: number }>;
  topIPs: Array<{ ip: string; count: number; lastScore: number }>;
}

const MAX_EVENTS = 500;
const events: SecurityEvent[] = [];
let totalRequests = 0;
let totalBlocked = 0;
let totalChallenged = 0;

const signalCounts = new Map<string, number>();
const ipTracker = new Map<string, { count: number; lastScore: number }>();

export function addEvent(event: SecurityEvent): void {
  events.push(event);
  if (events.length > MAX_EVENTS) events.shift();

  totalRequests++;
  if (event.action === 'block') totalBlocked++;
  if (event.action === 'challenge') totalChallenged++;

  for (const sig of event.signals) {
    signalCounts.set(sig.name, (signalCounts.get(sig.name) || 0) + 1);
  }

  const ipEntry = ipTracker.get(event.ip) || { count: 0, lastScore: 0 };
  ipEntry.count++;
  ipEntry.lastScore = event.threatScore;
  ipTracker.set(event.ip, ipEntry);
}

export function getEvents(limit: number = 100): SecurityEvent[] {
  return events.slice(-limit).reverse();
}

export function getEventsSince(timestamp: number): SecurityEvent[] {
  return events.filter((e) => e.timestamp > timestamp).reverse();
}

export function getStats(): EventStats {
  const topSignals = Array.from(signalCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topIPs = Array.from(ipTracker.entries())
    .map(([ip, data]) => ({ ip, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalRequests,
    blocked: totalBlocked,
    challenged: totalChallenged,
    allowed: totalRequests - totalBlocked - totalChallenged,
    topSignals,
    topIPs,
  };
}

export function clearEvents(): void {
  events.length = 0;
  totalRequests = 0;
  totalBlocked = 0;
  totalChallenged = 0;
  signalCounts.clear();
  ipTracker.clear();
}

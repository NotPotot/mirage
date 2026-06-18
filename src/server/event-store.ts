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

interface EventStore {
  events: SecurityEvent[];
  totalRequests: number;
  totalBlocked: number;
  totalChallenged: number;
  signalCounts: Map<string, number>;
  ipTracker: Map<string, { count: number; lastScore: number }>;
}

const MAX_EVENTS = 500;
const GLOBAL_KEY = '__mirage_event_store__';

function getStore(): EventStore {
  const g = globalThis as any;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = {
      events: [],
      totalRequests: 0,
      totalBlocked: 0,
      totalChallenged: 0,
      signalCounts: new Map(),
      ipTracker: new Map(),
    };
  }
  return g[GLOBAL_KEY];
}

export function addEvent(event: SecurityEvent): void {
  const store = getStore();
  store.events.push(event);
  if (store.events.length > MAX_EVENTS) store.events.shift();

  store.totalRequests++;
  if (event.action === 'block') store.totalBlocked++;
  if (event.action === 'challenge') store.totalChallenged++;

  for (const sig of event.signals) {
    store.signalCounts.set(sig.name, (store.signalCounts.get(sig.name) || 0) + 1);
  }

  const ipEntry = store.ipTracker.get(event.ip) || { count: 0, lastScore: 0 };
  ipEntry.count++;
  ipEntry.lastScore = event.threatScore;
  store.ipTracker.set(event.ip, ipEntry);
}

export function getEvents(limit: number = 100): SecurityEvent[] {
  return getStore().events.slice(-limit).reverse();
}

export function getEventsSince(timestamp: number): SecurityEvent[] {
  return getStore().events.filter((e) => e.timestamp > timestamp).reverse();
}

export function getStats(): EventStats {
  const store = getStore();

  const topSignals = Array.from(store.signalCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topIPs = Array.from(store.ipTracker.entries())
    .map(([ip, data]) => ({ ip, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalRequests: store.totalRequests,
    blocked: store.totalBlocked,
    challenged: store.totalChallenged,
    allowed: store.totalRequests - store.totalBlocked - store.totalChallenged,
    topSignals,
    topIPs,
  };
}

export function clearEvents(): void {
  const store = getStore();
  store.events.length = 0;
  store.totalRequests = 0;
  store.totalBlocked = 0;
  store.totalChallenged = 0;
  store.signalCounts.clear();
  store.ipTracker.clear();
}

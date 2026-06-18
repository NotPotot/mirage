import { signal } from '../../shared/scoring';
import type { Signal } from '../../types';

interface RequestSignature {
  method: string;
  pathPattern: string;
  contentType: string;
  bodyHash: string;
}

interface RepetitionRecord {
  signatures: Array<{ sig: string; timestamp: number }>;
  slowdownMs: number;
  flagged: boolean;
}

const store = new Map<string, RepetitionRecord>();

const WINDOW_MS = 5 * 60_000;
const REPEAT_THRESHOLD = 5;
const MAX_SLOWDOWN_MS = 5000;
const SLOWDOWN_STEP_MS = 500;

export function checkRepetition(
  fingerprint: string,
  method: string,
  url: string,
  contentType: string,
  bodySnippet: string
): { signals: Signal[]; slowdownMs: number } {
  const now = Date.now();
  const signals: Signal[] = [];

  let record = store.get(fingerprint);
  if (!record) {
    record = { signatures: [], slowdownMs: 0, flagged: false };
    store.set(fingerprint, record);
  }

  record.signatures = record.signatures.filter(
    (s) => now - s.timestamp < WINDOW_MS
  );

  const sig = createSignature(method, url, contentType, bodySnippet);

  record.signatures.push({ sig, timestamp: now });

  const sigCounts = new Map<string, number>();
  for (const entry of record.signatures) {
    sigCounts.set(entry.sig, (sigCounts.get(entry.sig) || 0) + 1);
  }

  let maxRepeat = 0;
  let repeatedSig = '';
  for (const [s, count] of sigCounts) {
    if (count > maxRepeat) {
      maxRepeat = count;
      repeatedSig = s;
    }
  }

  if (maxRepeat >= REPEAT_THRESHOLD) {
    const severity = Math.min(1, (maxRepeat - REPEAT_THRESHOLD + 1) / 10);

    signals.push(
      signal(
        'repeated-request-pattern',
        20,
        severity,
        `Same request pattern repeated ${maxRepeat} times in ${WINDOW_MS / 60000}min window`
      )
    );

    record.slowdownMs = Math.min(
      MAX_SLOWDOWN_MS,
      (maxRepeat - REPEAT_THRESHOLD + 1) * SLOWDOWN_STEP_MS
    );

    if (maxRepeat >= REPEAT_THRESHOLD * 2) {
      signals.push(
        signal(
          'excessive-repetition',
          25,
          1,
          `Request pattern repeated ${maxRepeat} times — flagged for review`
        )
      );
      record.flagged = true;
    }
  } else {
    record.slowdownMs = 0;
  }

  if (store.size > 10000) {
    for (const [key, rec] of store) {
      if (rec.signatures.length === 0) store.delete(key);
    }
  }

  return { signals, slowdownMs: record.slowdownMs };
}

function createSignature(
  method: string,
  url: string,
  contentType: string,
  bodySnippet: string
): string {
  const path = normalizeUrl(url);
  const bodyType = classifyBody(bodySnippet);
  return `${method}|${path}|${contentType}|${bodyType}`;
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname.replace(/\/[a-f0-9-]{20,}/gi, '/:id').replace(/\/\d+/g, '/:n');
  } catch {
    return url;
  }
}

function classifyBody(body: string): string {
  if (!body) return 'empty';
  if (body.length < 10) return 'tiny';

  const trimmed = body.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return `json-${body.length > 500 ? 'large' : 'small'}`;
  if (trimmed.includes('=') && trimmed.includes('&')) return 'form';
  if (/<[a-z]/i.test(trimmed)) return 'markup';

  return `text-${Math.floor(body.length / 100) * 100}`;
}

export function getRepetitionFlags(): Array<{ fingerprint: string; count: number }> {
  const flagged: Array<{ fingerprint: string; count: number }> = [];
  for (const [fp, record] of store) {
    if (record.flagged) {
      flagged.push({ fingerprint: fp, count: record.signatures.length });
    }
  }
  return flagged;
}

export function resetRepetitionTracker() {
  store.clear();
}

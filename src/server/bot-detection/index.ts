import { analyzeUserAgent } from './user-agent-analyzer';
import { analyzeHeaders } from './header-anomaly';
import { analyzePayload } from './payload-analyzer';
import type { Signal, RequestInfo } from '../../types';

export function detectBot(request: RequestInfo): Signal[] {
  const signals: Signal[] = [];
  signals.push(...analyzeUserAgent(request.userAgent));
  signals.push(...analyzeHeaders(request.headers));
  if (request.body) {
    signals.push(...analyzePayload(request.body));
  }
  return signals;
}

export { analyzeUserAgent, analyzeHeaders, analyzePayload };

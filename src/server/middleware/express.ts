import { mergeConfig } from '../../config';
import { scoreRequest } from '../fingerprint';
import { generateCSPHeader } from '../csp';
import { addEvent } from '../event-store';
import { createLogger } from '../../shared/logger';
import type { ShieldConfig, SensitivityLevel, RequestInfo } from '../../types';

type Req = {
  ip?: string;
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  get(name: string): string | undefined;
};

type Res = {
  status(code: number): Res;
  json(body: unknown): void;
  redirect(url: string): void;
  setHeader(name: string, value: string): void;
};

type NextFn = (err?: unknown) => void;

export function mirageExpress(
  userConfig: Partial<ShieldConfig> & { sensitivity?: SensitivityLevel } = {}
) {
  const config = mergeConfig(userConfig);
  const logger = createLogger(config.debug);
  const defaultSensitivity = userConfig.sensitivity || 'standard';

  return function mirageMiddleware(req: Req, res: Res, next: NextFn) {
    const requestInfo = extractRequestInfo(req);
    const sensitivity = matchRoute(req.url, config.routes) || defaultSensitivity;

    const { assessment, rateLimited, slowdownMs } = scoreRequest(
      requestInfo,
      config.rateLimit,
      sensitivity
    );

    addEvent({
      id: assessment.requestId,
      timestamp: assessment.timestamp,
      ip: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      url: req.url,
      method: req.method,
      threatScore: assessment.score,
      action: rateLimited ? 'block' : assessment.action,
      signals: assessment.signals,
      slowdownMs,
    });

    if (rateLimited) {
      logger.threat(`Rate limited: ${requestInfo.ip}`, assessment);
      res.status(429).json({ error: 'Too Many Requests' });
      return;
    }

    if (assessment.action === 'block' && config.onDetection === 'block') {
      logger.threat(`Blocked: ${requestInfo.ip}`, assessment);
      res.redirect(config.blockPage);
      return;
    }

    res.setHeader('Content-Security-Policy', generateCSPHeader(sensitivity));
    res.setHeader('X-Mirage-RequestId', assessment.requestId);
    res.setHeader('X-Mirage-Score', String(assessment.score));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    if (assessment.action === 'challenge') {
      res.setHeader('X-Mirage-Challenge', 'required');
    }

    if (slowdownMs > 0) {
      logger.warn(
        `Slowing down ${requestInfo.ip} by ${slowdownMs}ms — repeated request pattern`,
        { score: assessment.score }
      );
      res.setHeader('X-Mirage-Slowdown', String(slowdownMs));
      setTimeout(() => next(), slowdownMs);
      return;
    }

    next();
  };
}

function matchRoute(
  pathname: string,
  routes: Record<string, SensitivityLevel>
): SensitivityLevel | null {
  for (const [pattern, level] of Object.entries(routes)) {
    if (pattern === '/*') continue;
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\//g, '\\/') + '$'
    );
    if (regex.test(pathname)) return level;
  }
  return routes['/*'] || null;
}

function extractRequestInfo(req: Req): RequestInfo {
  const headers: Record<string, string> = {};
  for (const [key, val] of Object.entries(req.headers)) {
    if (typeof val === 'string') headers[key] = val;
    else if (Array.isArray(val)) headers[key] = val[0];
  }

  let body: string | undefined;
  if ((req as any).body) {
    const raw = (req as any).body;
    body = typeof raw === 'string' ? raw.slice(0, 2000) : JSON.stringify(raw).slice(0, 2000);
  }

  const forwarded = req.get?.('x-forwarded-for');
  return {
    ip: forwarded?.split(',')[0]?.trim() || req.ip || '0.0.0.0',
    userAgent: headers['user-agent'] || '',
    headers,
    method: req.method,
    url: req.url,
    timestamp: Date.now(),
    body,
  };
}

export type { ShieldConfig };

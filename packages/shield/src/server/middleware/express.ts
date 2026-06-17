import { mergeConfig } from '../../config';
import { scoreRequest } from '../fingerprint';
import { generateCSPHeader } from '../csp';
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

export function cipherHacksExpress(
  userConfig: Partial<ShieldConfig> & { sensitivity?: SensitivityLevel } = {}
) {
  const config = mergeConfig(userConfig);
  const logger = createLogger(config.debug);
  const defaultSensitivity = userConfig.sensitivity || 'standard';

  return function cipherHacksMiddleware(req: Req, res: Res, next: NextFn) {
    const requestInfo = extractRequestInfo(req);
    const sensitivity = matchRoute(req.url, config.routes) || defaultSensitivity;

    const { assessment, rateLimited } = scoreRequest(
      requestInfo,
      config.rateLimit,
      sensitivity
    );

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
    res.setHeader('X-CipherHacks-RequestId', assessment.requestId);
    res.setHeader('X-CipherHacks-Score', String(assessment.score));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    if (assessment.action === 'challenge') {
      res.setHeader('X-CipherHacks-Challenge', 'required');
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

  const forwarded = req.get?.('x-forwarded-for');
  return {
    ip: forwarded?.split(',')[0]?.trim() || req.ip || '0.0.0.0',
    userAgent: headers['user-agent'] || '',
    headers,
    method: req.method,
    url: req.url,
    timestamp: Date.now(),
  };
}

export type { ShieldConfig };

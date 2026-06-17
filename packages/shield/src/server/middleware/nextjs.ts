import { mergeConfig } from '../../config';
import { scoreRequest } from '../fingerprint';
import { generateCSPHeader } from '../csp';
import { createLogger } from '../../shared/logger';
import type { ShieldConfig, SensitivityLevel, RequestInfo } from '../../types';

export function createCipherHacksMiddleware(
  userConfig: Partial<ShieldConfig> = {}
) {
  const config = mergeConfig(userConfig);
  const logger = createLogger(config.debug);

  return async function cipherHacksMiddleware(request: Request) {
    const { NextResponse } = await import('next/server');
    const url = new URL(request.url);
    const pathname = url.pathname;

    const sensitivity = matchRoute(pathname, config.routes);
    const requestInfo = extractRequestInfo(request);

    const { assessment, rateLimited } = scoreRequest(
      requestInfo,
      config.rateLimit,
      sensitivity
    );

    if (config.debug) {
      logger.debug(`${request.method} ${pathname}`, {
        score: assessment.score,
        action: assessment.action,
        signals: assessment.signals.length,
      });
    }

    if (rateLimited) {
      logger.threat(`Rate limited: ${requestInfo.ip}`, assessment);
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    if (assessment.action === 'block' && config.onDetection === 'block') {
      logger.threat(`Blocked: ${requestInfo.ip}`, assessment);
      return NextResponse.redirect(new URL(config.blockPage, request.url));
    }

    const response = NextResponse.next();

    response.headers.set(
      'Content-Security-Policy',
      generateCSPHeader(sensitivity)
    );
    response.headers.set('X-CipherHacks-RequestId', assessment.requestId);
    response.headers.set(
      'X-CipherHacks-Score',
      String(assessment.score)
    );
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    if (assessment.action === 'challenge') {
      response.headers.set('X-CipherHacks-Challenge', 'required');
    }

    return response;
  };
}

function matchRoute(
  pathname: string,
  routes: Record<string, SensitivityLevel>
): SensitivityLevel {
  for (const [pattern, level] of Object.entries(routes)) {
    if (pattern === '/*') continue;
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\//g, '\\/') + '$'
    );
    if (regex.test(pathname)) return level;
  }
  return routes['/*'] || 'standard';
}

function extractRequestInfo(request: Request): RequestInfo {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return {
    ip:
      headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      headers['x-real-ip'] ||
      '0.0.0.0',
    userAgent: headers['user-agent'] || '',
    headers,
    method: request.method,
    url: request.url,
    timestamp: Date.now(),
  };
}

export type { ShieldConfig };

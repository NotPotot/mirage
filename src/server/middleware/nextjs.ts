import { mergeConfig } from '../../config';
import { scoreRequest } from '../fingerprint';
import { generateCSPHeader } from '../csp';
import { createLogger } from '../../shared/logger';
import type { ShieldConfig, SensitivityLevel, RequestInfo } from '../../types';

export function createMirageMiddleware(
  userConfig: Partial<ShieldConfig> = {}
) {
  const config = mergeConfig(userConfig);
  const logger = createLogger(config.debug);

  return async function mirageMiddleware(request: Request) {
    const { NextResponse } = await import('next/server');
    const url = new URL(request.url);
    const pathname = url.pathname;

    const sensitivity = matchRoute(pathname, config.routes);
    const requestInfo = await extractRequestInfo(request);

    const { assessment, rateLimited, slowdownMs } = scoreRequest(
      requestInfo,
      config.rateLimit,
      sensitivity
    );

    if (config.eventsUrl) {
      const event = {
        id: assessment.requestId,
        timestamp: assessment.timestamp,
        ip: requestInfo.ip,
        userAgent: requestInfo.userAgent,
        url: pathname,
        method: request.method,
        threatScore: assessment.score,
        action: rateLimited ? 'block' : assessment.action,
        signals: assessment.signals,
        slowdownMs,
      };
      const eventsOrigin = new URL(request.url).origin;
      fetch(`${eventsOrigin}${config.eventsUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch(() => {});
    }

    if (config.debug) {
      logger.debug(`${request.method} ${pathname}`, {
        score: assessment.score,
        action: assessment.action,
        signals: assessment.signals.length,
        slowdownMs,
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

    if (assessment.action === 'challenge' && config.onDetection !== 'monitor') {
      logger.threat(`Challenged/blocked: ${requestInfo.ip} (score: ${assessment.score})`, assessment);
      return new NextResponse(
        '<!DOCTYPE html><html><body><h1>Access Denied</h1><p>Suspicious activity detected.</p></body></html>',
        { status: 403, headers: { 'Content-Type': 'text/html', 'X-Mirage-Score': String(assessment.score) } }
      );
    }

    if (slowdownMs >= 2000) {
      logger.threat(
        `Excessive repetition from ${requestInfo.ip} — blocking (slowdown: ${slowdownMs}ms)`,
        assessment
      );
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: { 'X-Mirage-Slowdown': String(slowdownMs), 'Retry-After': String(Math.ceil(slowdownMs / 1000)) },
      });
    }

    if (slowdownMs > 0) {
      logger.warn(
        `Slowing down ${requestInfo.ip} by ${slowdownMs}ms — repeated request pattern`,
        { score: assessment.score }
      );
      await new Promise((resolve) => setTimeout(resolve, slowdownMs));
    }

    const response = NextResponse.next();

    response.headers.set(
      'Content-Security-Policy',
      generateCSPHeader(sensitivity)
    );
    response.headers.set('X-Mirage-RequestId', assessment.requestId);
    response.headers.set(
      'X-Mirage-Score',
      String(assessment.score)
    );
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    if (assessment.action === 'challenge') {
      response.headers.set('X-Mirage-Challenge', 'required');
    }

    if (slowdownMs > 0) {
      response.headers.set('X-Mirage-Slowdown', String(slowdownMs));
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

async function extractRequestInfo(request: Request): Promise<RequestInfo> {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let body: string | undefined;
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
    try {
      const cloned = request.clone();
      const text = await cloned.text();
      body = text.slice(0, 2000);
    } catch {}
  }

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
    body,
  };
}

export type { ShieldConfig };

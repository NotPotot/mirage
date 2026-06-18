import { signal } from '../../shared/scoring';
import type { Signal } from '../../types';

export function analyzeHeaders(headers: Record<string, string>): Signal[] {
  const signals: Signal[] = [];
  const ua = headers['user-agent'] || '';
  const isChromium =
    ua.includes('Chrome/') || ua.includes('Chromium/') || ua.includes('Edge/');

  if (!headers['accept-language']) {
    signals.push(
      signal(
        'missing-accept-language',
        15,
        1,
        'Accept-Language header is missing'
      )
    );
  }

  if (isChromium && !headers['sec-ch-ua']) {
    signals.push(
      signal(
        'missing-sec-ch-ua',
        20,
        1,
        'Chromium browser missing sec-ch-ua client hint'
      )
    );
  }

  if (!headers['sec-fetch-site'] && !headers['sec-fetch-mode']) {
    signals.push(
      signal(
        'missing-sec-fetch',
        15,
        1,
        'Sec-Fetch-Site and Sec-Fetch-Mode headers both missing'
      )
    );
  }

  if (
    headers['sec-fetch-site'] === 'cross-site' &&
    headers['sec-fetch-mode'] === 'navigate'
  ) {
    signals.push(
      signal(
        'suspicious-sec-fetch',
        10,
        1,
        'Cross-site navigation fetch — possible automated redirect chain'
      )
    );
  }

  if (!headers['referer'] && headers['sec-fetch-site'] !== 'none') {
    signals.push(
      signal('missing-referer', 10, 0.5, 'Referer header missing on non-direct navigation')
    );
  }

  const connectionHeader = headers['connection'];
  if (connectionHeader === 'close') {
    signals.push(
      signal(
        'connection-close',
        10,
        0.5,
        'Connection: close suggests single-shot automated request'
      )
    );
  }

  return signals;
}

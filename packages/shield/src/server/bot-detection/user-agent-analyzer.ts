import { signal } from '../../shared/scoring';
import { matchesBotPattern } from '../../shared/patterns';
import type { Signal } from '../../types';

export function analyzeUserAgent(userAgent: string): Signal[] {
  const signals: Signal[] = [];

  const botMatch = matchesBotPattern(userAgent);
  if (botMatch) {
    signals.push(
      signal('known-bot-ua', 35, 1, `Matched known bot pattern: ${botMatch}`)
    );
  }

  if (!userAgent || userAgent.length < 10) {
    signals.push(
      signal('missing-ua', 20, 1, 'User-Agent is missing or suspiciously short')
    );
  }

  if (/headlesschrome/i.test(userAgent)) {
    signals.push(
      signal('headless-chrome-ua', 30, 1, 'HeadlessChrome detected in UA string')
    );
  }

  if (/phantomjs/i.test(userAgent)) {
    signals.push(
      signal('phantomjs-ua', 30, 1, 'PhantomJS detected in UA string')
    );
  }

  return signals;
}

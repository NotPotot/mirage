export const KNOWN_BOT_USER_AGENTS = [
  'GPTBot',
  'ChatGPT-User',
  'Claude-User',
  'anthropic-ai',
  'Applebot-Extended',
  'Google-Extended',
  'GoogleOther',
  'CCBot',
  'PerplexityBot',
  'Bytespider',
  'PetalBot',
  'Amazonbot',
  'ClaudeBot',
  'cohere-ai',
  'Diffbot',
  'FacebookBot',
  'ImagesiftBot',
  'Omgilibot',
  'YouBot',
  'AI2Bot',
  'Scrapy',
  'python-requests',
  'axios',
  'node-fetch',
  'Go-http-client',
  'Java/',
  'libwww-perl',
  'curl/',
  'wget/',
  'HeadlessChrome',
  'PhantomJS',
  'Selenium',
  'puppeteer',
  'playwright',
];

export const HEADLESS_WEBGL_RENDERERS = [
  'SwiftShader',
  'llvmpipe',
  'Mesa',
  'ANGLE (Unknown',
  'Google SwiftShader',
];

export const SUSPICIOUS_HEADER_PATTERNS = {
  missingAcceptLanguage: true,
  missingSecChUa: true,
  missingSecFetchSite: true,
  uniformAcceptEncoding: 'gzip, deflate, br',
};

export function matchesBotPattern(userAgent: string): string | null {
  const ua = userAgent.toLowerCase();
  for (const pattern of KNOWN_BOT_USER_AGENTS) {
    if (ua.includes(pattern.toLowerCase())) {
      return pattern;
    }
  }
  return null;
}

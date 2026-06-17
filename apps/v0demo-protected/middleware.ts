import { createCipherHacksMiddleware } from '@cipherhacks/shield/nextjs'

export const middleware = createCipherHacksMiddleware({
  routes: {
    '/checkout*': 'maximum',
    '/api/checkout*': 'maximum',
    '/api/products*': 'high',
    '/*': 'standard',
  },
  onDetection: 'block',
  blockPage: '/blocked',
  rateLimit: {
    windowMs: 60_000,
    maxRequests: 30,
    aiPatternMultiplier: 0.5,
  },
  eventsUrl: '/api/cipherhacks/events',
  debug: true,
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|products/|admin|api/cipherhacks|blocked|.*\\.png$|.*\\.svg$|.*\\.jpg$).*)'],
}

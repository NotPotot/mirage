import { createMirageMiddleware } from '@mirageshield/mirage/nextjs'

export const middleware = createMirageMiddleware({
  routes: {
    '/checkout*': 'maximum',
    '/api/checkout*': 'maximum',
    '/api/products*': 'high',
    '/api/mirage/report*': 'high',
    '/*': 'standard',
  },
  onDetection: 'block',
  blockPage: '/blocked',
  rateLimit: {
    windowMs: 60_000,
    maxRequests: 30,
    aiPatternMultiplier: 0.5,
  },
  eventsUrl: '/api/mirage/events',
  debug: true,
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|products/|admin|api/mirage/events|blocked|.*\\.png$|.*\\.svg$|.*\\.jpg$).*)'],
}

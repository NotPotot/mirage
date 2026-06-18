# Mirage

**Mirage** is a multi-layered security toolkit that protects web applications from AI-driven attacks, headless scrapers, bots, and automated abuse.

It works in two places at once — **server-side middleware** fingerprints every request and blocks threats before they reach your app, while **client-side JavaScript** actively defends sensitive form fields, detects headless browsers, and traps automated bots with honeypots.

> **mirage-shield** is the core package at `packages/shield`. This monorepo also includes a protected demo app and an attack simulation suite for testing.

---

## Features

| Layer | Defense |
|---|---|
| **Bot Detection** | User-agent analysis, header anomaly detection, payload inspection for prompt injection / SQLi |
| **Traffic Analysis** | AI-aware rate limiting, repetition tracking with adaptive slowdown |
| **Content Security** | Auto-generated CSP headers per route sensitivity level |
| **DOM Shield** | Masks `data-sensitive` input values from headless scrapers; real values only surface during genuine user interaction |
| **Honeypot Fields** | Invisible form fields injected into forms; bots that fill them are detected and blocked |
| **Headless Detection** | Identifies Playwright, Puppeteer, Selenium, and other automation frameworks via WebGL, canvas fingerprinting, CDP flags, and behavioral signals |
| **Proof of Work** | Optional client-side challenge for suspicious sessions |
| **Behavior Tracking** | Monitors mouse movement and keystroke patterns to distinguish humans from bots |
| **Event Logging** | Built-in event store for security auditing and dashboards |

---

## Quick Start

```bash
# Install in your project
npm install mirage-shield

# Run the setup wizard
npx mirage
```

The CLI detects your framework (Next.js, Express, or React) and generates the correct configuration automatically.

### Next.js

```ts
// middleware.ts
import { createMirageMiddleware } from 'mirage-shield/nextjs'

export const middleware = createMirageMiddleware({
  onDetection: 'block',
  blockPage: '/blocked',
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
```

### Express

```ts
import { mirageExpress } from 'mirage-shield/express'

app.use(mirageExpress({ onDetection: 'block' }))
```

### React (Client-side)

Wrap your app with `<MirageProvider>` to enable DOM shielding, honeypots, and headless detection:

```tsx
import { MirageProvider } from 'mirage-shield/react'

function App() {
  return (
    <MirageProvider
      protectSelectors={['[data-sensitive]', 'input[type="password"]']}
      honeypotFields={true}
      behaviorTracking={true}
    >
      <YourApp />
    </MirageProvider>
  )
}
```

---

## Attack Simulation

This repo includes an attack simulator that tests 5 real-world attack vectors against vulnerable and protected demos.

```bash
# Attack the protected demo (runs on localhost:3003)
npm run attack:protected

# Attack an unprotected demo (localhost:3002)
npm run attack:vulnerable

# Compare both side-by-side
npm run attack
```

The simulation runs:
1. **Bot UA Scrape** — Fetches pages with `GPTBot` user-agent
2. **Headless DOM Scrape** — Launches headless Chromium and attempts to read/fill form fields
3. **Honeypot Trap** — Scans for and interacts with hidden fields
4. **Rate Limit Flood** — Sends 35 rapid requests to test throttling
5. **Payload Injection** — Sends SQLi, XSS, and prompt injection payloads

---

## Configuration

```ts
createMirageMiddleware({
  routes: {
    '/checkout': 'maximum',
    '/account': 'high',
    '/*': 'standard',
  },
  onDetection: 'block',        // 'block' | 'challenge' | 'monitor'
  blockPage: '/blocked',
  rateLimit: {
    windowMs: 60_000,          // 1 minute window
    maxRequests: 60,           // max requests per window
    aiPatternMultiplier: 0.5,  // stricter limits for AI-like patterns
  },
})
```

Route sensitivity levels adjust thresholds:
- **standard** — default (1.0× multiplier)
- **high** — stricter (1.2×) for account pages
- **maximum** — strictest (1.5×) for checkout, auth, payment flows

---

## Architecture

```
Request → Next.js/Express Middleware
              │
              ├── Bot Detection (UA, headers, payload)
              ├── Rate Limiter (AI-aware, repetition tracking)
              └── Fingerprint Scoring
                      │
              ┌───────┴───────┐
              │               │
           Allow           Block/Challenge
              │               │
        Response +      Redirect / 429
        CSP headers
              │
        Client loads
              │
        ┌──────┴──────┐
        │              │
   DOM Shield    Honeypots
   Headless       Behavior
   Detection      Tracking
```

---

## Packages

| Package | Description |
|---|---|
| `mirage-shield` | Core shield library (server + client) |
| `v0demo-protected` | Example Next.js app with Mirage Shield deployed |

---

## License

MIT

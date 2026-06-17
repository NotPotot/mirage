#!/usr/bin/env node

import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'fs'
import { execSync } from 'child_process'
import { join } from 'path'

const GREEN = '\x1b[32m'
const CYAN = '\x1b[36m'
const YELLOW = '\x1b[33m'
const RED = '\x1b[31m'
const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'
const RESET = '\x1b[0m'

const cwd = process.cwd()

function log(msg) { console.log(`  ${msg}`) }
function step(n, msg) { console.log(`\n${GREEN}[${n}]${RESET} ${BOLD}${msg}${RESET}`) }
function done(msg) { log(`${GREEN}✓${RESET} ${msg}`) }
function warn(msg) { log(`${YELLOW}⚠${RESET} ${msg}`) }
function fail(msg) { console.error(`\n${RED}✗ ${msg}${RESET}`); process.exit(1) }

console.log(`
${BOLD}╔════════════════════════════════════════════════╗${RESET}
${BOLD}║${RESET}  ${CYAN}${BOLD}cipherhacks-shield${RESET} — Install & Configure   ${BOLD}║${RESET}
${BOLD}╚════════════════════════════════════════════════╝${RESET}
`)

// ─── Detect project type ───

const pkgPath = join(cwd, 'package.json')
if (!existsSync(pkgPath)) {
  fail('No package.json found. Run this from the root of your project.')
}

const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
const deps = { ...pkg.dependencies, ...pkg.devDependencies }

const isNext = !!deps['next']
const isExpress = !!deps['express']
const hasReact = !!deps['react']

if (!isNext && !isExpress) {
  fail('CipherHacks supports Next.js and Express projects. Neither detected in package.json.')
}

log(`${DIM}Project: ${pkg.name || 'unnamed'}${RESET}`)
log(`${DIM}Framework: ${isNext ? 'Next.js' : 'Express'}${RESET}`)

// ─── Step 1: Install package ───

step(1, 'Installing cipherhacks-shield...')

const hasShield = deps['cipherhacks-shield']
if (hasShield) {
  done('Already installed')
} else {
  const pm = existsSync(join(cwd, 'pnpm-lock.yaml')) ? 'pnpm'
    : existsSync(join(cwd, 'yarn.lock')) ? 'yarn'
    : 'npm'

  const installCmd = pm === 'yarn' ? 'yarn add cipherhacks-shield' : `${pm} install cipherhacks-shield`
  log(`${DIM}$ ${installCmd}${RESET}`)

  try {
    execSync(installCmd, { cwd, stdio: 'pipe' })
    done('Installed')
  } catch (e) {
    warn(`Auto-install failed. Run manually: ${installCmd}`)
  }
}

// ─── Step 2: Create middleware ───

if (isNext) {
  step(2, 'Creating middleware.ts...')

  const srcDir = existsSync(join(cwd, 'src')) ? 'src' : ''
  const middlewarePath = join(cwd, srcDir, 'middleware.ts')

  if (existsSync(middlewarePath)) {
    warn(`middleware.ts already exists — skipping (add CipherHacks manually)`)
  } else {
    const content = `import { createCipherHacksMiddleware } from 'cipherhacks-shield/nextjs'

export const middleware = createCipherHacksMiddleware({
  onDetection: 'block',
  blockPage: '/blocked',
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\\\.png$|.*\\\\.svg$|.*\\\\.jpg$).*)'],
}
`
    writeFileSync(middlewarePath, content)
    done(`Created ${srcDir ? 'src/' : ''}middleware.ts`)
  }

  // ─── Step 3: Create /blocked page ───

  step(3, 'Creating /blocked page...')

  const appDir = existsSync(join(cwd, 'src', 'app')) ? join(cwd, 'src', 'app')
    : existsSync(join(cwd, 'app')) ? join(cwd, 'app')
    : null

  if (!appDir) {
    warn('No app/ directory found — skipping blocked page')
  } else {
    const blockedDir = join(appDir, 'blocked')
    const blockedPath = join(blockedDir, 'page.tsx')

    if (existsSync(blockedPath)) {
      warn('/blocked page already exists — skipping')
    } else {
      mkdirSync(blockedDir, { recursive: true })
      const blockedPage = `export default function BlockedPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center', maxWidth: 420, padding: 24 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🛡️</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Access Blocked</h1>
        <p style={{ color: '#666', lineHeight: 1.6 }}>
          CipherHacks has detected automated or suspicious activity from your
          session. This request has been blocked to protect sensitive data.
        </p>
      </div>
    </div>
  )
}
`
      writeFileSync(blockedPath, blockedPage)
      done('Created app/blocked/page.tsx')
    }
  }

  // ─── Step 4: Create events API ───

  step(4, 'Creating security events API...')

  if (appDir) {
    const eventsDir = join(appDir, 'api', 'cipherhacks', 'events')
    const eventsPath = join(eventsDir, 'route.ts')

    if (existsSync(eventsPath)) {
      warn('Events API already exists — skipping')
    } else {
      mkdirSync(eventsDir, { recursive: true })
      const eventsRoute = `import { NextResponse } from 'next/server'
import { addEvent, getEvents, getEventsSince, getStats } from 'cipherhacks-shield'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const since = url.searchParams.get('since')
  if (since) return NextResponse.json({ events: getEventsSince(parseInt(since, 10)), stats: getStats() })
  return NextResponse.json({ events: getEvents(200), stats: getStats() })
}

export async function POST(request: Request) {
  try {
    const event = await request.json()
    addEvent(event)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
`
      writeFileSync(eventsPath, eventsRoute)
      done('Created api/cipherhacks/events/route.ts')
    }
  }
}

if (isExpress) {
  step(2, 'Express detected — add this to your server file:')
  console.log(`
  ${CYAN}const { cipherHacksExpress } = require('cipherhacks-shield/express')
  app.use(cipherHacksExpress({ onDetection: 'block' }))${RESET}
`)
}

// ─── Done ───

console.log(`
${BOLD}${GREEN}════════════════════════════════════════════════${RESET}
${BOLD}${GREEN}  CipherHacks Shield is installed and active! ${RESET}
${BOLD}${GREEN}════════════════════════════════════════════════${RESET}

  ${DIM}Start your dev server and visit your site.
  Bot requests, headless browsers, and scrapers
  will be detected and blocked automatically.${RESET}

  ${BOLD}Admin dashboard:${RESET} /admin
  ${BOLD}Blocked page:${RESET}    /blocked
  ${BOLD}Events API:${RESET}      /api/cipherhacks/events

  ${DIM}Docs: https://github.com/YOUR_USER/cipherhacks${RESET}
`)

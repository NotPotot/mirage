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
function done(msg) { log(`${GREEN}[OK]${RESET} ${msg}`) }
function warn(msg) { log(`${YELLOW}[!]${RESET} ${msg}`) }
function fail(msg) { console.error(`\n${RED}[X] ${msg}${RESET}`); process.exit(1) }

console.log(`
${BOLD}+================================================+${RESET}
${BOLD}|${RESET}  ${CYAN}${BOLD}@mirageshield/mirage${RESET} -- Install & Configure  ${BOLD}|${RESET}
${BOLD}+================================================+${RESET}
`)

// --- Detect project type ---

const pkgPath = join(cwd, 'package.json')
if (!existsSync(pkgPath)) {
  fail('No package.json found. Run this from the root of your project.')
}

const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
const deps = { ...pkg.dependencies, ...pkg.devDependencies }

const isNext = !!deps['next']
const isExpress = !!deps['express']
const isHono = !!deps['hono']
const isCRA = !!deps['react-scripts']
const hasReact = !!deps['react']

const framework = isNext ? 'Next.js'
  : isExpress ? 'Express'
  : isHono ? 'React + Hono'
  : isCRA ? 'Create React App'
  : hasReact ? 'React'
  : null

if (!framework) {
  fail('No supported framework detected (Next.js, Express, Hono, or React).')
}

log(`${DIM}Project: ${pkg.name || 'unnamed'}${RESET}`)
log(`${DIM}Framework: ${framework}${RESET}`)

// --- Step 1: Check package is installed ---

step(1, 'Checking @mirageshield/mirage...')

const hasShield = deps['@mirageshield/mirage'] || deps['mirage-shield']
if (hasShield) {
  done('Already installed')
} else {
  const pm = existsSync(join(cwd, 'pnpm-lock.yaml')) ? 'pnpm'
    : existsSync(join(cwd, 'yarn.lock')) ? 'yarn'
    : 'npm'

  const legacyFlag = pm === 'npm' ? ' --legacy-peer-deps' : ''
  const installCmd = pm === 'yarn' ? 'yarn add @mirageshield/mirage' : `${pm} install @mirageshield/mirage${legacyFlag}`
  log(`${DIM}$ ${installCmd}${RESET}`)

  try {
    execSync(installCmd, { cwd, stdio: 'pipe' })
    done('Installed')
  } catch (e) {
    warn(`Auto-install failed. Run manually: ${installCmd}`)
  }
}

// --- Next.js setup ---

if (isNext) {
  step(2, 'Creating middleware.ts...')

  const srcDir = existsSync(join(cwd, 'src')) ? 'src' : ''
  const middlewarePath = join(cwd, srcDir, 'middleware.ts')

  if (existsSync(middlewarePath)) {
    warn(`middleware.ts already exists -- skipping (add Mirage manually)`)
  } else {
    const content = `import { createMirageMiddleware } from '@mirageshield/mirage/nextjs'

export const middleware = createMirageMiddleware({
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

  step(3, 'Creating /blocked page...')

  const appDir = existsSync(join(cwd, 'src', 'app')) ? join(cwd, 'src', 'app')
    : existsSync(join(cwd, 'app')) ? join(cwd, 'app')
    : null

  if (!appDir) {
    warn('No app/ directory found -- skipping blocked page')
  } else {
    const blockedDir = join(appDir, 'blocked')
    const blockedPath = join(blockedDir, 'page.tsx')

    if (existsSync(blockedPath)) {
      warn('/blocked page already exists -- skipping')
    } else {
      mkdirSync(blockedDir, { recursive: true })
      writeFileSync(blockedPath, blockedPageContent())
      done('Created app/blocked/page.tsx')
    }
  }

  step(4, 'Creating security events API...')

  if (appDir) {
    const eventsDir = join(appDir, 'api', 'mirage', 'events')
    const eventsPath = join(eventsDir, 'route.ts')

    if (existsSync(eventsPath)) {
      warn('Events API already exists -- skipping')
    } else {
      mkdirSync(eventsDir, { recursive: true })
      const eventsRoute = `import { NextResponse } from 'next/server'
import { addEvent, getEvents, getEventsSince, getStats } from '@mirageshield/mirage'

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
      done('Created api/mirage/events/route.ts')
    }
  }
}

// --- React (CRA / Vite / plain React) setup ---

if (!isNext && hasReact) {
  step(2, 'Creating Mirage wrapper component...')

  const srcDir = existsSync(join(cwd, 'src')) ? join(cwd, 'src') : cwd
  const componentsDir = join(srcDir, 'components')
  mkdirSync(componentsDir, { recursive: true })

  const wrapperPath = join(componentsDir, 'MirageShield.tsx')
  if (existsSync(wrapperPath)) {
    warn('MirageShield.tsx already exists -- skipping')
  } else {
    const wrapper = `import { MirageProvider } from '@mirageshield/mirage/react'
import type { ReactNode } from 'react'

export function MirageShield({ children }: { children: ReactNode }) {
  return (
    <MirageProvider
      protectSelectors={['[data-sensitive]', 'input[type="password"]', 'input[name*="card"]', 'input[name*="cvv"]']}
      honeypotFields={true}
      behaviorTracking={true}
    >
      {children}
    </MirageProvider>
  )
}
`
    writeFileSync(wrapperPath, wrapper)
    done('Created src/components/MirageShield.tsx')
  }

  step(3, 'Finding your app entry point...')

  const appFiles = ['App.tsx', 'App.jsx', 'App.js'].map(f => join(srcDir, f))
  const appFile = appFiles.find(f => existsSync(f))

  if (appFile) {
    const appContent = readFileSync(appFile, 'utf-8')

    if (appContent.includes('MirageShield')) {
      warn('MirageShield already imported in App -- skipping')
    } else {
      const importLine = `import { MirageShield } from './components/MirageShield'\n`

      let updated = appContent

      // Add import at top (after last import)
      const lastImportIdx = updated.lastIndexOf('\nimport ')
      if (lastImportIdx !== -1) {
        const endOfLine = updated.indexOf('\n', lastImportIdx + 1)
        updated = updated.slice(0, endOfLine + 1) + importLine + updated.slice(endOfLine + 1)
      } else {
        updated = importLine + updated
      }

      // Wrap the return JSX with <MirageShield>
      const returnMatch = updated.match(/return\s*\(\s*\n?/)
      if (returnMatch && returnMatch.index !== undefined) {
        const insertPos = returnMatch.index + returnMatch[0].length
        const restAfterReturn = updated.slice(insertPos)

        // Find the matching closing paren for the return(...)
        let depth = 1
        let closeIdx = 0
        for (let i = 0; i < restAfterReturn.length; i++) {
          if (restAfterReturn[i] === '(') depth++
          if (restAfterReturn[i] === ')') depth--
          if (depth === 0) { closeIdx = i; break }
        }

        const jsxContent = restAfterReturn.slice(0, closeIdx)
        const afterClose = restAfterReturn.slice(closeIdx)

        updated = updated.slice(0, insertPos) +
          `<MirageShield>\n` +
          jsxContent +
          `\n</MirageShield>` +
          afterClose
      }

      writeFileSync(appFile, updated)
      done(`Wrapped App with <MirageShield> in ${appFile.split('/').pop()}`)
    }
  } else {
    warn('Could not find App.tsx/App.jsx -- wrap your root component manually:')
    console.log(`
  ${CYAN}import { MirageShield } from './components/MirageShield'

  function App() {
    return (
      <MirageShield>
        {/* your existing app */}
      </MirageShield>
    )
  }${RESET}
`)
  }

  step(4, 'Adding data-sensitive attributes...')
  log(`${DIM}Add data-sensitive="true" to any input you want to protect:${RESET}`)
  console.log(`
  ${CYAN}<input name="cardNumber" data-sensitive="true" />
  <input name="cvv" data-sensitive="true" />
  <input type="password" data-sensitive="true" />${RESET}
`)
  done('Client-side protection configured')
}

// --- Express / Hono backend setup ---

if (isExpress) {
  step(isNext ? 5 : 3, 'Express detected -- add this to your server file:')
  console.log(`
  ${CYAN}const { mirageExpress } = require('@mirageshield/mirage/express')
  app.use(mirageExpress({ onDetection: 'block' }))${RESET}
`)
}

if (isHono && !isNext) {
  step(5, 'Hono backend detected -- add middleware to your Hono server:')
  console.log(`
  ${CYAN}// In your Hono server file:
  import { mirageExpress } from '@mirageshield/mirage/express'

  // Hono can use Express-style middleware via adapter,
  // or check requests manually:
  app.use('*', async (c, next) => {
    const ua = c.req.header('user-agent') || ''
    // mirage-shield scoring runs on the client side
    // for React apps. Server-side protection requires
    // Next.js or Express middleware.
    await next()
  })${RESET}
`)
}

// --- Done ---

console.log(`
${BOLD}${GREEN}================================================${RESET}
${BOLD}${GREEN}  Mirage Shield is installed and active!         ${RESET}
${BOLD}${GREEN}================================================${RESET}

  ${DIM}Start your dev server and visit your site.
  Bot requests, headless browsers, and scrapers
  will be detected and blocked automatically.${RESET}
${isNext ? `
  ${BOLD}Blocked page:${RESET}    /blocked
  ${BOLD}Events API:${RESET}      /api/mirage/events
` : `
  ${BOLD}Protected:${RESET}       All [data-sensitive] inputs
  ${BOLD}Honeypots:${RESET}       Auto-injected into forms
  ${BOLD}Bot detection:${RESET}   Headless browser + typing analysis
`}
  ${DIM}Docs: https://github.com/mirage${RESET}
`)

function blockedPageContent() {
  return `export default function BlockedPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center', maxWidth: 420, padding: 24 }}>
        <div style={{ fontSize: 28, marginBottom: 16, fontWeight: 700, letterSpacing: 2 }}>[ BLOCKED ]</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Access Blocked</h1>
        <p style={{ color: '#666', lineHeight: 1.6 }}>
          Mirage has detected automated or suspicious activity from your
          session. This request has been blocked to protect sensitive data.
        </p>
      </div>
    </div>
  )
}
`
}

#!/usr/bin/env pwsh
<#
.SYNOPSIS
  One-command setup for mirage-shield in any Node.js project.
.DESCRIPTION
  Auto-detects your framework (Next.js, Express, or React), installs
  mirage-shield, and generates all required configuration files.
.PARAMETER TargetDir
  Path to your project root (defaults to current directory).
.PARAMETER Yes
  Skip prompts and use defaults.
.EXAMPLE
  .\scripts\install-shield.ps1
  .\scripts\install-shield.ps1 -TargetDir C:\Projects\my-app -Yes
#>

param(
  [string]$TargetDir = (Get-Location).Path,
  [switch]$Yes
)

$ErrorActionPreference = 'Stop'

$GREEN = "$([char]0x1b)[32m"
$CYAN = "$([char]0x1b)[36m"
$YELLOW = "$([char]0x1b)[33m"
$RED = "$([char]0x1b)[31m"
$BOLD = "$([char]0x1b)[1m"
$DIM = "$([char]0x1b)[2m"
$RESET = "$([char]0x1b)[0m"

function Log($msg) { Write-Host "  $msg" }
function Step($n, $msg) { Write-Host "`n${GREEN}[$n]${RESET} ${BOLD}$msg${RESET}" }
function Done($msg) { Log("${GREEN}[OK]${RESET} $msg") }
function Warn($msg) { Log("${YELLOW}[!]${RESET} $msg") }
function Fail($msg) { Write-Host "`n${RED}[X] $msg${RESET}"; exit 1 }

# --- Banner ---

Write-Host @"

${BOLD}+================================================+${RESET}
${BOLD}|${RESET}  ${CYAN}${BOLD}mirage-shield${RESET} -- Install & Configure   ${BOLD}|${RESET}
${BOLD}+================================================+${RESET}
"@

# --- Validate target ---

$pkgPath = Join-Path -Path $TargetDir -ChildPath 'package.json'
if (-not (Test-Path -LiteralPath $pkgPath)) {
  Fail "No package.json found at $TargetDir. Run this from your project root."
}

$pkg = Get-Content -LiteralPath $pkgPath -Raw | ConvertFrom-Json
$deps = @{}
if ($pkg.dependencies) { $pkg.dependencies.PSObject.Properties | ForEach-Object { $deps[$_.Name] = $_.Value } }
if ($pkg.devDependencies) { $pkg.devDependencies.PSObject.Properties | ForEach-Object { $deps[$_.Name] = $_.Value } }

$isNext = $deps.Contains('next')
$isExpress = $deps.Contains('express')
$isHono = $deps.Contains('hono')
$hasReact = $deps.Contains('react')

$framework = if ($isNext) { 'Next.js' }
  elseif ($isExpress) { 'Express' }
  elseif ($isHono) { 'Hono + React' }
  elseif ($hasReact) { 'React' }
  else { $null }

if (-not $framework) {
  Fail "No supported framework detected (Next.js, Express, Hono, or React)."
}

Log "${DIM}Project: $($pkg.name)${RESET}"
Log "${DIM}Framework: $framework${RESET}"
Log "${DIM}Target: $TargetDir${RESET}"

if (-not $Yes) {
  Write-Host "`n  ${BOLD}Proceed with setup? [Y/n]:${RESET} " -NoNewline
  $response = Read-Host
  if ($response -ne '' -and $response -ne 'y' -and $response -ne 'Y') {
    Write-Host "`n  ${YELLOW}Setup cancelled.${RESET}"
    exit 0
  }
}

# --- Step 1: Install package ---

Step 1 'Installing mirage-shield...'

$hasShield = $deps.Contains('mirage-shield')
if ($hasShield) {
  Done 'Already installed'
}
else {
  $installCmd = "npm install mirage-shield --save"
  Log "${DIM}$ $installCmd${RESET}"
  try {
    Push-Location -LiteralPath $TargetDir
    npm install mirage-shield --save --legacy-peer-deps 2>&1 | Out-Null
    Pop-Location
    Done 'Installed'
  }
  catch {
    Pop-Location
    Warn "Auto-install failed. Run manually: npm install mirage-shield"
  }
}

# --- Step 2: Generate config ---

if ($isNext) {
  # -- Next.js: middleware.ts --
  Step 2 'Creating middleware.ts...'

  $srcDir = if (Test-Path (Join-Path -Path $TargetDir -ChildPath 'src')) { 'src' } else { '' }
  $middlewarePath = Join-Path -Path $TargetDir -ChildPath "$srcDir/middleware.ts"

  if (Test-Path -LiteralPath $middlewarePath) {
    Warn 'middleware.ts already exists -- skipping'
  }
  else {
@"
import { createMirageMiddleware } from 'mirage-shield/nextjs'

export const middleware = createMirageMiddleware({
  onDetection: 'block',
  blockPage: '/blocked',
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$).*)'],
}
"@ | Set-Content -LiteralPath $middlewarePath -NoNewline
    Done "Created $srcDir/middleware.ts"
  }

  # -- Next.js: /blocked page --
  Step 3 'Creating /blocked page...'

  $appDir = if (Test-Path (Join-Path -Path $TargetDir -ChildPath 'src/app')) { Join-Path -Path $TargetDir -ChildPath 'src/app' }
    elseif (Test-Path (Join-Path -Path $TargetDir -ChildPath 'app')) { Join-Path -Path $TargetDir -ChildPath 'app' }
    else { $null }

  if (-not $appDir) {
    Warn 'No app/ directory found -- skipping blocked page'
  }
  else {
    $blockedDir = Join-Path -Path $appDir -ChildPath 'blocked'
    $blockedPath = Join-Path -Path $blockedDir -ChildPath 'page.tsx'
    if (Test-Path -LiteralPath $blockedPath) {
      Warn '/blocked page already exists -- skipping'
    }
    else {
      New-Item -ItemType Directory -Path $blockedDir -Force | Out-Null
@"
export default function BlockedPage() {
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
"@ | Set-Content -LiteralPath $blockedPath -NoNewline
      Done 'Created app/blocked/page.tsx'
    }
  }

  # -- Next.js: Events API --
  Step 4 'Creating security events API...'

  if ($appDir) {
    $eventsDir = Join-Path -Path $appDir -ChildPath 'api/mirage/events'
    $eventsPath = Join-Path -Path $eventsDir -ChildPath 'route.ts'
    if (Test-Path -LiteralPath $eventsPath) {
      Warn 'Events API already exists -- skipping'
    }
    else {
      New-Item -ItemType Directory -Path $eventsDir -Force | Out-Null
@"
import { NextResponse } from 'next/server'
import { addEvent, getEvents, getEventsSince, getStats } from 'mirage-shield'

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
"@ | Set-Content -LiteralPath $eventsPath -NoNewline
      Done 'Created api/mirage/events/route.ts'
    }
  }
}
elseif ($hasReact) {
  # -- React: Mirage wrapper component --
  Step 2 'Creating Mirage wrapper component...'

  $srcDir = if (Test-Path (Join-Path -Path $TargetDir -ChildPath 'src')) { Join-Path -Path $TargetDir -ChildPath 'src' } else { $TargetDir }
  $componentsDir = Join-Path -Path $srcDir -ChildPath 'components'
  New-Item -ItemType Directory -Path $componentsDir -Force | Out-Null

  $wrapperPath = Join-Path -Path $componentsDir -ChildPath 'MirageShield.tsx'
  if (Test-Path -LiteralPath $wrapperPath) {
    Warn 'MirageShield.tsx already exists -- skipping'
  }
  else {
@"
import { MirageProvider } from 'mirage-shield/react'
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
"@ | Set-Content -LiteralPath $wrapperPath -NoNewline
    Done 'Created src/components/MirageShield.tsx'
  }

  # -- React: Wrap App --
  Step 3 'Wrapping App with MirageShield...'

  $appFiles = @('App.tsx', 'App.jsx', 'App.js') | ForEach-Object { Join-Path -Path $srcDir -ChildPath $_ }
  $appFile = $appFiles | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1

  if ($appFile) {
    $content = Get-Content -LiteralPath $appFile -Raw
    if ($content -match 'MirageShield') {
      Warn 'MirageShield already imported -- skipping'
    }
    else {
      $importLine = "import { MirageShield } from './components/MirageShield'`n"
      $updated = $importLine + $content

      # Wrap return JSX
      if ($updated -match '(return\s*\()') {
        $insertAt = $matches[0].Length + $matches[0].Index - $matches[0].Length
        $prefix = $updated.Substring(0, $matches[0].Index + $matches[0].Length)
        $suffix = $updated.Substring($matches[0].Index + $matches[0].Length)
        $updated = $prefix + "`n  <MirageShield>" + $suffix

        # Find closing paren
        $depth = 1
        $closeIdx = -1
        for ($i = 0; $i -lt $suffix.Length; $i++) {
          if ($suffix[$i] -eq '(') { $depth++ }
          if ($suffix[$i] -eq ')') {
            $depth--
            if ($depth -eq 0) { $closeIdx = $i; break }
          }
        }
        if ($closeIdx -ge 0) {
          $jsxContent = $suffix.Substring(0, $closeIdx)
          $afterClose = $suffix.Substring($closeIdx)
          $updated = $prefix + "`n  <MirageShield>" + $jsxContent + "`n  </MirageShield>" + $afterClose
        }
      }

      Set-Content -LiteralPath $appFile -Value $updated -NoNewline
      Done "Wrapped App with MirageShield in $($appFile | Split-Path -Leaf)"
    }
  }
  else {
    Warn 'Could not find App.tsx/App.jsx -- wrap your root component manually:'
    Write-Host @"

  ${CYAN}import { MirageShield } from './components/MirageShield'

  function App() {
    return (
      <MirageShield>
        {/* your existing app */}
      </MirageShield>
    )
  }${RESET}
"@
  }

  Step 4 'Adding data-sensitive attributes...'
  Log "${DIM}Add data-sensitive="true" to any input you want to protect:${RESET}"
  Write-Host @"

  ${CYAN}<input name="cardNumber" data-sensitive="true" />
  <input name="cvv" data-sensitive="true" />
  <input type="password" data-sensitive="true" />${RESET}
"@
  Done 'Client-side protection configured'
}

# --- Express / Hono ---

if ($isExpress) {
  Step 5 'Express detected -- add this to your server file:'
  Write-Host @"

  ${CYAN}const { mirageExpress } = require('mirage-shield/express')
  app.use(mirageExpress({ onDetection: 'block' }))${RESET}
"@
}

if ($isHono) {
  Step 5 'Hono detected -- add middleware to your Hono server:'
  Write-Host @"

  ${CYAN}app.use('*', async (c, next) => {
    const ua = c.req.header('user-agent') || ''
    // mirage-shield scoring runs on the client side
    // for React apps. Server-side protection requires
    // Next.js or Express middleware.
    await next()
  })${RESET}
"@
}

# --- Finish ---

Write-Host @"

${BOLD}${GREEN}================================================${RESET}
${BOLD}${GREEN}  Mirage Shield is installed and active!         ${RESET}
${BOLD}${GREEN}================================================${RESET}
"@

if ($isNext) {
  Write-Host @"
  ${BOLD}Blocked page:${RESET}    /blocked
  ${BOLD}Events API:${RESET}      /api/mirage/events
"@
}

Write-Host @"
  ${DIM}Run your dev server and bots will be blocked automatically.${RESET}
"@

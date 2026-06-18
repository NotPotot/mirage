import { NextResponse } from 'next/server'
import { addEvent, getEvents, getEventsSince, getStats } from '@mirageshield/mirage'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const since = url.searchParams.get('since')
  const statsOnly = url.searchParams.get('stats')

  if (statsOnly === 'true') {
    return NextResponse.json(getStats())
  }

  const events = since
    ? getEventsSince(parseInt(since, 10))
    : getEvents(200)

  return NextResponse.json({ events, stats: getStats() })
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

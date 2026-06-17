import { NextResponse } from 'next/server'
import { getEvents, getEventsSince, getStats } from '@cipherhacks/shield'

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

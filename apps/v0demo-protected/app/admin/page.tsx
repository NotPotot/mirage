'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Download,
  Hexagon,
  Inbox,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
import { DemoBanner } from '@/components/demo-banner'
import { useStore } from '@/components/store-provider'
import { formatPrice } from '@/lib/products'
import { cn } from '@/lib/utils'

type SecurityEvent = {
  id: string
  timestamp: number
  ip: string
  userAgent: string
  url: string
  method: string
  threatScore: number
  action: 'allow' | 'challenge' | 'block'
  signals: Array<{ name: string; weight: number; value: number; evidence: string }>
  slowdownMs: number
}

type EventStats = {
  totalRequests: number
  blocked: number
  challenged: number
  allowed: number
  topSignals: Array<{ name: string; count: number }>
  topIPs: Array<{ ip: string; count: number; lastScore: number }>
}

export default function AdminPage() {
  const [tab, setTab] = useState<'security' | 'orders'>('security')

  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      <DemoBanner />

      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
          <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
            <Hexagon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-lg font-semibold leading-tight">
              Admin Dashboard
            </h1>
            <p className="text-xs text-muted-foreground">
              Mirage protected — internal view
            </p>
          </div>
          <Link
            href="/"
            className="ml-auto rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Back to store
          </Link>
        </div>

        <div className="mx-auto flex max-w-6xl gap-1 px-4 sm:px-6">
          <TabButton
            active={tab === 'security'}
            onClick={() => setTab('security')}
            icon={<Shield className="size-4" />}
            label="Security"
          />
          <TabButton
            active={tab === 'orders'}
            onClick={() => setTab('orders')}
            icon={<ShoppingBag className="size-4" />}
            label="Orders"
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {tab === 'security' ? <SecurityTab /> : <OrdersTab />}
      </main>
    </div>
  )
}

/* ─── Security Tab ─── */

function SecurityTab() {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [stats, setStats] = useState<EventStats | null>(null)
  const [lastFetch, setLastFetch] = useState(0)

  const poll = useCallback(async () => {
    try {
      const url = lastFetch
        ? `/api/mirage/events?since=${lastFetch}`
        : '/api/mirage/events'
      const res = await fetch(url)
      const data = await res.json()
      if (data.events?.length > 0) {
        setEvents((prev) => {
          const ids = new Set(prev.map((e) => e.id))
          const fresh = data.events.filter((e: SecurityEvent) => !ids.has(e.id))
          return [...fresh, ...prev].slice(0, 500)
        })
        setLastFetch(data.events[0].timestamp)
      }
      if (data.stats) setStats(data.stats)
    } catch {}
  }, [lastFetch])

  useEffect(() => {
    poll()
    const interval = setInterval(poll, 2000)
    return () => clearInterval(interval)
  }, [poll])

  const blocked = events.filter((e) => e.action === 'block')
  const challenged = events.filter((e) => e.action === 'challenge')

  return (
    <>
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard
          label="Total requests"
          value={String(stats?.totalRequests ?? events.length)}
          icon={<Activity className="size-4" />}
        />
        <StatCard
          label="Blocked"
          value={String(stats?.blocked ?? blocked.length)}
          icon={<ShieldAlert className="size-4" />}
          variant="destructive"
        />
        <StatCard
          label="Challenged"
          value={String(stats?.challenged ?? challenged.length)}
          icon={<ShieldAlert className="size-4" />}
          variant="warning"
        />
        <StatCard
          label="Allowed"
          value={String(stats?.allowed ?? events.length - blocked.length - challenged.length)}
          icon={<ShieldCheck className="size-4" />}
          variant="success"
        />
      </div>

      {/* Top signals */}
      {stats && stats.topSignals.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold">Top threat signals</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {stats.topSignals.slice(0, 8).map((s) => (
              <span
                key={s.name}
                className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive"
              >
                {s.name} ({s.count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Live event feed */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            Live threat feed
          </h3>
          <span className="text-xs text-muted-foreground">
            Auto-refreshing every 2s
          </span>
        </div>

        {events.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Shield className="size-6" />
            </span>
            <p className="font-medium">No events yet</p>
            <p className="text-sm text-muted-foreground">
              Security events will appear here in real-time as requests are processed.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {events.slice(0, 100).map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function EventRow({ event }: { event: SecurityEvent }) {
  const [expanded, setExpanded] = useState(false)

  const actionColor =
    event.action === 'block'
      ? 'bg-destructive/10 text-destructive border-destructive/20'
      : event.action === 'challenge'
        ? 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400'
        : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400'

  const scoreColor =
    event.threatScore >= 70
      ? 'text-destructive'
      : event.threatScore >= 40
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-emerald-600 dark:text-emerald-400'

  const time = new Date(event.timestamp).toLocaleTimeString()

  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm"
      >
        <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold uppercase', actionColor)}>
          {event.action}
        </span>
        <span className={cn('shrink-0 font-mono text-sm font-bold', scoreColor)}>
          {event.threatScore}
        </span>
        <span className="min-w-0 flex-1 truncate font-medium">
          {event.method} {event.url}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">{event.ip}</span>
        <span className="shrink-0 text-xs text-muted-foreground">{time}</span>
      </button>

      {expanded && (
        <div className="border-t border-border bg-secondary/30 px-4 py-3">
          <div className="grid gap-2 text-xs sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">User-Agent: </span>
              <span className="break-all">{event.userAgent || '(empty)'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Request ID: </span>
              <span className="font-mono">{event.id}</span>
            </div>
            {event.slowdownMs > 0 && (
              <div>
                <span className="text-muted-foreground">Slowdown: </span>
                <span>{event.slowdownMs}ms</span>
              </div>
            )}
          </div>
          {event.signals.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-muted-foreground">Signals triggered:</p>
              <div className="mt-1.5 space-y-1">
                {event.signals.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="shrink-0 rounded bg-destructive/10 px-1.5 py-0.5 font-mono font-semibold text-destructive">
                      +{Math.round(s.weight * s.value)}
                    </span>
                    <span className="font-medium">{s.name}</span>
                    <span className="text-muted-foreground">— {s.evidence}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Orders Tab (original) ─── */

function OrdersTab() {
  const { orders, deleteOrder } = useStore()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return orders
    return orders.filter(
      (o) =>
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q),
    )
  }, [orders, query])

  const revenue = orders.reduce((sum, o) => sum + o.total, 0)

  function exportJson() {
    const blob = new Blob([JSON.stringify(orders, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `demo-orders-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total demo orders" value={String(orders.length)} />
        <StatCard label="Simulated revenue" value={formatPrice(revenue)} />
        <StatCard label="Showing" value={`${filtered.length} of ${orders.length}`} />
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          All records below are simulated demo orders stored only in this
          browser. Card numbers are masked and no data is transmitted anywhere.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex flex-1 items-center">
          <Search
            className="pointer-events-none absolute left-3 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or order ID..."
            aria-label="Search orders"
            className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          type="button"
          onClick={exportJson}
          disabled={orders.length === 0}
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Download className="size-4" />
          Export JSON
        </button>
      </div>

      {orders.length === 0 ? (
        <EmptyState title="No demo orders yet" desc="Place a demo order at checkout to see it appear here." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No matching orders" desc="Try a different search term." />
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Address</th>
                <th className="px-4 py-3 font-medium">Card number</th>
                <th className="px-4 py-3 font-medium">CVV</th>
                <th className="px-4 py-3 font-medium">Expiry</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((order) => (
                <tr key={order.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {order.customer.address}, {order.customer.city}, {order.customer.state} {order.customer.zip}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{order.cardNumber || order.maskedCard}</td>
                  <td className="px-4 py-3 font-mono text-xs">{order.cvv || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{order.expiry || '—'}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => deleteOrder(order.id)}
                      aria-label={`Delete order ${order.id}`}
                      className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

/* ─── Shared components ─── */

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'border-primary text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function StatCard({
  label,
  value,
  icon,
  variant,
}: {
  label: string
  value: string
  icon?: React.ReactNode
  variant?: 'destructive' | 'warning' | 'success'
}) {
  const color =
    variant === 'destructive'
      ? 'text-destructive'
      : variant === 'warning'
        ? 'text-amber-600 dark:text-amber-400'
        : variant === 'success'
          ? 'text-emerald-600 dark:text-emerald-400'
          : ''

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className={cn('mt-1 text-2xl font-semibold', color)}>{value}</p>
    </div>
  )
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Inbox className="size-6" aria-hidden="true" />
      </span>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  )
}

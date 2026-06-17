'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  Download,
  Hexagon,
  Inbox,
  Search,
  ShieldAlert,
  Trash2,
} from 'lucide-react'
import { DemoBanner } from '@/components/demo-banner'
import { useStore } from '@/components/store-provider'
import { formatPrice } from '@/lib/products'

export default function AdminPage() {
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
              Demo orders — internal view
            </p>
          </div>
          <Link
            href="/"
            className="ml-auto rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Back to store
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Total demo orders" value={String(orders.length)} />
          <Stat label="Simulated revenue" value={formatPrice(revenue)} />
          <Stat
            label="Showing"
            value={`${filtered.length} of ${orders.length}`}
          />
        </div>

        {/* Notice */}
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            All records below are simulated demo orders stored only in this
            browser. Card numbers are masked and no data is transmitted
            anywhere.
          </p>
        </div>

        {/* Controls */}
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

        {/* Orders */}
        {orders.length === 0 ? (
          <EmptyState
            title="No demo orders yet"
            desc="Place a demo order at checkout to see it appear here."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No matching orders"
            desc="Try a different search term."
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="mt-6 hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Shipping address</th>
                    <th className="px-4 py-3 font-medium">Card</th>
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
                        <p className="text-xs text-muted-foreground">
                          {order.customer.email}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {order.customer.address}
                        <br />
                        {order.customer.city}, {order.customer.state}{' '}
                        {order.customer.zip}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {order.maskedCard}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatPrice(order.total)}
                      </td>
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

            {/* Mobile cards */}
            <ul className="mt-6 space-y-3 md:hidden">
              {filtered.map((order) => (
                <li
                  key={order.id}
                  className="rounded-2xl border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteOrder(order.id)}
                      aria-label={`Delete order ${order.id}`}
                      className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <dl className="mt-3 space-y-1 text-sm">
                    <Line label="Customer" value={order.customer.name} />
                    <Line label="Email" value={order.customer.email} />
                    <Line
                      label="Address"
                      value={`${order.customer.address}, ${order.customer.city}, ${order.customer.state} ${order.customer.zip}`}
                    />
                    <Line label="Card" value={order.maskedCard} mono />
                    <Line label="Total" value={formatPrice(order.total)} />
                  </dl>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  )
}

function Line({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex gap-2">
      <dt className="w-20 shrink-0 text-muted-foreground">{label}</dt>
      <dd className={mono ? 'font-mono text-muted-foreground' : ''}>{value}</dd>
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

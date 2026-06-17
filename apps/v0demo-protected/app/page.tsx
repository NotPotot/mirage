'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowRight, Search, ShieldCheck, Truck, Headphones } from 'lucide-react'
import { DemoBanner } from '@/components/demo-banner'
import { Navbar } from '@/components/navbar'
import { CartDrawer } from '@/components/cart-drawer'
import { SiteFooter } from '@/components/site-footer'
import { ProductCard } from '@/components/product-card'
import { products } from '@/lib/products'

export default function HomePage() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products.slice(0, 4)
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    )
  }, [query])

  const isSearching = query.trim().length > 0

  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <Navbar query={query} onQueryChange={setQuery} />
      <CartDrawer />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
          <div className="grid items-center gap-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10 lg:grid-cols-2">
            <div className="flex flex-col gap-5">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                New arrivals · Spring drop
              </span>
              <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Smart tech for a faster, simpler day.
              </h1>
              <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">
                Discover thoughtfully designed gadgets that work together
                seamlessly. Free shipping on orders over $75 — for this demo,
                of course.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Shop all products
                  <ArrowRight className="size-4" />
                </Link>
                <a
                  href="#featured"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  View featured
                </a>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
              <Image
                src="/hero-banner.png"
                alt="A modern workspace with tech gadgets"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Truck,
                title: 'Fast, free shipping',
                desc: 'On demo orders over $75.',
              },
              {
                icon: ShieldCheck,
                title: 'Secure by design',
                desc: 'Built to showcase safe checkout flows.',
              },
              {
                icon: Headphones,
                title: 'Friendly support',
                desc: 'A helpful team, 24/7 (in theory).',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mobile search */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 md:hidden">
          <div className="relative flex items-center">
            <Search
              className="pointer-events-none absolute left-3 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-primary"
            />
          </div>
        </section>

        {/* Featured / search results */}
        <section id="featured" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {isSearching ? 'Search results' : 'Featured products'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isSearching
                  ? `${filtered.length} matching ${filtered.length === 1 ? 'product' : 'products'}`
                  : 'A few of our most popular picks.'}
              </p>
            </div>
            {!isSearching && (
              <Link
                href="/products"
                className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
              >
                See all <ArrowRight className="size-4" />
              </Link>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
              <p className="font-medium">No products found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

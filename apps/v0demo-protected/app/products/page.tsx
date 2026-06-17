'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { DemoBanner } from '@/components/demo-banner'
import { Navbar } from '@/components/navbar'
import { CartDrawer } from '@/components/cart-drawer'
import { SiteFooter } from '@/components/site-footer'
import { ProductCard } from '@/components/product-card'
import { products } from '@/lib/products'
import { cn } from '@/lib/utils'

const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))]

export default function ProductsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [query, category])

  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <Navbar query={query} onQueryChange={setQuery} />
      <CartDrawer />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">All products</h1>
          <p className="text-muted-foreground">
            Browse our full catalog of {products.length} demo products.
          </p>
        </div>

        {/* Mobile search */}
        <div className="relative mt-6 flex items-center md:hidden">
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

        {/* Category filter */}
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                'rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors',
                category === c
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="mt-8">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card py-20 text-center">
              <p className="text-lg font-medium">No products found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

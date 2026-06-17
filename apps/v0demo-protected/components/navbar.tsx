'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Hexagon, Search, ShoppingCart } from 'lucide-react'
import { useStore } from '@/components/store-provider'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
]

export function Navbar({
  query,
  onQueryChange,
}: {
  query?: string
  onQueryChange?: (value: string) => void
}) {
  const pathname = usePathname()
  const { cartCount, setCartOpen } = useStore()

  return (
    <header className="sticky top-[33px] z-40 border-b border-border bg-background/80 backdrop-blur-md sm:top-[37px]">
      <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Hexagon className="size-5" aria-hidden="true" />
          </span>
          <span className="hidden text-lg tracking-tight sm:inline">
            Nimbus Tech
          </span>
        </Link>

        <div className="relative ml-2 hidden flex-1 items-center md:flex">
          <Search
            className="pointer-events-none absolute left-3 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query ?? ''}
            onChange={(e) => onQueryChange?.(e.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            className="h-10 w-full rounded-full border border-border bg-secondary/60 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:bg-card"
          />
        </div>

        <ul className="ml-auto flex items-center gap-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
                  pathname === link.href && 'bg-secondary text-foreground',
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setCartOpen(true)}
          aria-label={`Open cart, ${cartCount} items`}
          className="relative flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
        >
          <ShoppingCart className="size-5" aria-hidden="true" />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {cartCount}
            </span>
          )}
        </button>
      </nav>
    </header>
  )
}

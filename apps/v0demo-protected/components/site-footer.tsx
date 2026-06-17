import Link from 'next/link'
import { Hexagon } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Hexagon className="size-5" aria-hidden="true" />
          </span>
          Nimbus Tech
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <Link href="/products" className="hover:text-foreground">
            Products
          </Link>
          <Link href="/checkout" className="hover:text-foreground">
            Checkout
          </Link>
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
        </nav>
        <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
          This is a demonstration store for a cybersecurity hackathon. No real
          orders are processed and no data leaves your browser.
        </p>
      </div>
    </footer>
  )
}

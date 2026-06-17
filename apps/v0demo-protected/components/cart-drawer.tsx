'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useStore } from '@/components/store-provider'
import { formatPrice } from '@/lib/products'

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setCartOpen,
    setQuantity,
    removeFromCart,
    subtotal,
  } = useStore()

  return (
    <>
      <div
        aria-hidden={!isCartOpen}
        onClick={() => setCartOpen(false)}
        className={`fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-card shadow-xl transition-transform duration-300 ease-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ShoppingBag className="size-5" aria-hidden="true" />
            Your Cart
          </h2>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
              <ShoppingBag
                className="size-7 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <p className="font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">
              Add some products to get started.
            </p>
            <Link
              href="/products"
              onClick={() => setCartOpen(false)}
              className="mt-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
              {cart.map((item) => (
                <li key={item.product.id} className="flex gap-4 py-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                    <Image
                      src={item.product.image || '/placeholder.svg'}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">
                        {item.product.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        aria-label={`Remove ${item.product.name}`}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatPrice(item.product.price)}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-border">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.product.id, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.product.id, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-5 py-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={() => setCartOpen(false)}
                className="mt-4 flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Proceed to Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  )
}

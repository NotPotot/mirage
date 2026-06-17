'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
} from 'lucide-react'
import { DemoBanner } from '@/components/demo-banner'
import { Navbar } from '@/components/navbar'
import { CartDrawer } from '@/components/cart-drawer'
import { SiteFooter } from '@/components/site-footer'
import { useStore, type Order } from '@/components/store-provider'
import { formatPrice } from '@/lib/products'
import {
  SAMPLE_CARDS,
  formatCardNumber,
  formatExpiry,
  isTestCard,
  isValidCvv,
  isValidExpiry,
  maskCard,
} from '@/lib/payment'

type Shipping = {
  name: string
  email: string
  address: string
  city: string
  state: string
  zip: string
}

const emptyShipping: Shipping = {
  name: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zip: '',
}

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, subtotal, addOrder, clearCart } = useStore()
  const [shipping, setShipping] = useState<Shipping>(emptyShipping)
  const [cardholder, setCardholder] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  const shippingComplete =
    shipping.name &&
    shipping.email &&
    shipping.address &&
    shipping.city &&
    shipping.state &&
    shipping.zip

  const shippingCost = subtotal > 75 || subtotal === 0 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shippingCost + tax

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!shippingComplete) {
      setError('Please complete all shipping fields.')
      return
    }
    if (!cardholder.trim()) {
      setError('Please enter the cardholder name.')
      return
    }
    if (!isTestCard(cardNumber)) {
      setError(
        'Only demo test cards are accepted. Use one of the sample cards below.',
      )
      return
    }
    if (!isValidExpiry(expiry)) {
      setError('Enter a valid expiration date (MM/YY).')
      return
    }
    if (!isValidCvv(cvv)) {
      setError('Enter a valid 3-digit CVV (e.g. 123).')
      return
    }

    setProcessing(true)
    // Simulated processing — purely client-side, nothing is sent anywhere.
    setTimeout(() => {
      const order: Order = {
        id: `DEMO-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        customer: { ...shipping },
        maskedCard: maskCard(cardNumber),
        cardholder: cardholder.trim(),
        items: cart.map((item) => ({
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        total,
      }
      addOrder(order)
      clearCart()
      setProcessing(false)
      setSuccess(true)
    }, 1400)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <Navbar />
      <CartDrawer />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {success ? (
          <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <CheckCircle2 className="size-7" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-2xl font-semibold">Order placed!</h1>
            <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
              This was a simulated demo order. No payment was processed and your
              information stayed entirely in your browser.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/products"
                className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Continue shopping
              </Link>
              <Link
                href="/admin"
                className="rounded-full border border-border px-5 py-3 text-sm font-medium transition-colors hover:bg-secondary"
              >
                View in admin dashboard
              </Link>
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl border border-dashed border-border bg-card p-10 text-center">
            <h1 className="text-2xl font-semibold">Your cart is empty</h1>
            <p className="mt-2 text-muted-foreground">
              Add a product before heading to checkout.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Back to products"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]"
            >
              <div className="flex flex-col gap-8">
                {/* Shipping */}
                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="text-lg font-semibold">
                    Shipping information
                  </h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Full name"
                      className="sm:col-span-2"
                      value={shipping.name}
                      onChange={(v) => setShipping({ ...shipping, name: v })}
                      placeholder="Jordan Rivera"
                      autoComplete="name"
                    />
                    <Field
                      label="Email"
                      type="email"
                      className="sm:col-span-2"
                      value={shipping.email}
                      onChange={(v) => setShipping({ ...shipping, email: v })}
                      placeholder="jordan@example.com"
                      autoComplete="email"
                    />
                    <Field
                      label="Address"
                      className="sm:col-span-2"
                      value={shipping.address}
                      onChange={(v) => setShipping({ ...shipping, address: v })}
                      placeholder="123 Demo Street"
                      autoComplete="street-address"
                    />
                    <Field
                      label="City"
                      value={shipping.city}
                      onChange={(v) => setShipping({ ...shipping, city: v })}
                      placeholder="Springfield"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        label="State"
                        value={shipping.state}
                        onChange={(v) => setShipping({ ...shipping, state: v })}
                        placeholder="CA"
                      />
                      <Field
                        label="ZIP code"
                        value={shipping.zip}
                        onChange={(v) =>
                          setShipping({
                            ...shipping,
                            zip: v.replace(/\D/g, '').slice(0, 5),
                          })
                        }
                        placeholder="90210"
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                </section>

                {/* Payment */}
                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                      <CreditCard className="size-5" aria-hidden="true" />
                      Payment
                    </h2>
                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                      <ShieldCheck className="size-3.5" /> CipherHacks Protected
                    </span>
                  </div>

                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                    <p>
                      These fields are protected by CipherHacks DOM Shield —
                      values are obfuscated in the DOM and invisible to scrapers.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-4">
                    <Field
                      label="Cardholder name"
                      value={cardholder}
                      onChange={setCardholder}
                      placeholder="Jordan Rivera"
                      sensitive
                    />
                    <Field
                      label="Card number"
                      value={cardNumber}
                      onChange={(v) => setCardNumber(formatCardNumber(v))}
                      placeholder="4111 1111 1111 1111"
                      inputMode="numeric"
                      sensitive
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        label="Expiration"
                        value={expiry}
                        onChange={(v) => setExpiry(formatExpiry(v))}
                        placeholder="MM/YY"
                        inputMode="numeric"
                        sensitive
                      />
                      <Field
                        label="CVV"
                        value={cvv}
                        onChange={(v) => setCvv(v.replace(/\D/g, '').slice(0, 3))}
                        placeholder="123"
                        inputMode="numeric"
                        sensitive
                      />
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-secondary p-3 text-sm">
                    <p className="font-medium">Sample test cards</p>
                    <ul className="mt-1 space-y-1 font-mono text-muted-foreground">
                      {SAMPLE_CARDS.map((card) => (
                        <li key={card}>
                          <button
                            type="button"
                            onClick={() => setCardNumber(card)}
                            className="rounded transition-colors hover:text-foreground hover:underline"
                          >
                            {card}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Use any future MM/YY and any 3-digit CVV.
                    </p>
                  </div>
                </section>
              </div>

              {/* Order summary */}
              <aside className="lg:sticky lg:top-28 lg:h-fit">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="text-lg font-semibold">Order summary</h2>
                  <ul className="mt-4 space-y-3">
                    {cart.map((item) => (
                      <li
                        key={item.product.id}
                        className="flex items-center gap-3"
                      >
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                          <Image
                            src={item.product.image || '/placeholder.svg'}
                            alt={item.product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                            {item.quantity}
                          </span>
                        </div>
                        <p className="flex-1 text-sm leading-tight">
                          {item.product.name}
                        </p>
                        <span className="text-sm font-medium">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                    <Row label="Subtotal" value={formatPrice(subtotal)} />
                    <Row
                      label="Shipping"
                      value={
                        shippingCost === 0 ? 'Free' : formatPrice(shippingCost)
                      }
                    />
                    <Row label="Tax (8%)" value={formatPrice(tax)} />
                    <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  {error && (
                    <p className="mt-4 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={processing}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Pay {formatPrice(total)} (Demo)</>
                    )}
                  </button>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    No real payment is processed.
                  </p>
                </div>
              </aside>
            </form>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
  autoComplete,
  inputMode,
  sensitive,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  className?: string
  autoComplete?: string
  inputMode?: 'text' | 'numeric' | 'email'
  sensitive?: boolean
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <span className="text-sm font-medium">
        {label}
        {sensitive && (
          <span className="ml-1.5 text-xs text-emerald-600">🛡️</span>
        )}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        data-sensitive={sensitive ? 'true' : undefined}
        className={`h-11 rounded-xl border px-3.5 text-sm outline-none transition-colors focus:ring-2 ${
          sensitive
            ? 'border-emerald-300 bg-emerald-50/50 focus:border-emerald-500 focus:ring-emerald-200/50 dark:border-emerald-800 dark:bg-emerald-950/20 dark:focus:border-emerald-600 dark:focus:ring-emerald-900/50'
            : 'border-border bg-background focus:border-primary focus:ring-ring/30'
        }`}
      />
    </label>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}

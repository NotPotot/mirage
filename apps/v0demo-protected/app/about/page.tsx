import { ShieldCheck, Target, Users } from 'lucide-react'
import { DemoBanner } from '@/components/demo-banner'
import { Navbar } from '@/components/navbar'
import { CartDrawer } from '@/components/cart-drawer'
import { SiteFooter } from '@/components/site-footer'

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <Navbar />
      <CartDrawer />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          About this demonstration
        </h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Nimbus Tech is a fictional electronics store created to demonstrate a
          realistic online shopping experience for a cybersecurity hackathon.
          Everything you see here — products, prices, orders, and payments — is
          simulated. No transactions are processed and no data is sent to any
          external service.
        </p>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          The goal is to provide a safe, production-quality sandbox where
          security concepts such as input validation, data handling, and
          checkout flows can be explored without any real-world risk.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Target,
              title: 'Purpose-built',
              desc: 'A focused demo for learning and showcasing security ideas.',
            },
            {
              icon: ShieldCheck,
              title: 'Safe by default',
              desc: 'All data stays in your browser. Nothing is transmitted.',
            },
            {
              icon: Users,
              title: 'For everyone',
              desc: 'Designed to be accessible and easy to explore.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-3 font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

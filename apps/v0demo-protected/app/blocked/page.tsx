import Link from 'next/link'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export default function BlockedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="size-8 text-destructive" aria-hidden="true" />
        </span>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Access Blocked
        </h1>

        <p className="mt-3 leading-relaxed text-muted-foreground">
          CipherHacks has detected automated or suspicious activity from your
          session. This request has been blocked to protect sensitive data.
        </p>

        <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-left text-sm">
          <p className="font-semibold text-destructive">
            Why was I blocked?
          </p>
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            <li>• Automated browser (headless/bot) detected</li>
            <li>• Known AI scraper user-agent identified</li>
            <li>• Suspicious request patterns or rate limiting</li>
            <li>• Honeypot field interaction detected</li>
          </ul>
        </div>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="size-4" />
          Back to store
        </Link>

        <p className="mt-4 text-xs text-muted-foreground">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  )
}

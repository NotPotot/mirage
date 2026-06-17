import { ShieldCheck } from 'lucide-react'

export function DemoBanner() {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-emerald-700 px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
      <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
      <span className="text-pretty">
        Protected by CipherHacks Shield — AI breach defense, DOM obfuscation,
        honeypots, and bot detection active.
      </span>
    </div>
  )
}

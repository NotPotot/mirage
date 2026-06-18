'use client'

import { useState } from 'react'
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react'
import { useShieldStatus } from '@mirageshield/mirage/react'

export function ShieldStatusWidget() {
  const status = useShieldStatus()
  const [expanded, setExpanded] = useState(false)

  const Icon = status.headlessDetected
    ? ShieldAlert
    : status.active
      ? ShieldCheck
      : Shield

  const bgColor = status.headlessDetected
    ? 'bg-destructive'
    : status.active
      ? 'bg-emerald-600'
      : 'bg-muted-foreground'

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`${bgColor} flex size-12 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110`}
        title="Mirage Shield Status"
      >
        <Icon className="size-5" />
      </button>

      {expanded && (
        <div className="absolute bottom-14 right-0 w-72 rounded-2xl border border-border bg-card p-4 shadow-xl">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="size-4 text-emerald-600" />
            Mirage Shield
          </h3>

          <div className="mt-3 space-y-2 text-sm">
            <Row
              label="Status"
              value={status.active ? 'Active' : 'Initializing...'}
              valueClass={status.active ? 'text-emerald-600' : 'text-muted-foreground'}
            />
            <Row
              label="Threat Score"
              value={`${status.threatScore}/100`}
              valueClass={
                status.threatScore > 60
                  ? 'text-destructive'
                  : status.threatScore > 30
                    ? 'text-amber-500'
                    : 'text-emerald-600'
              }
            />
            <Row
              label="Headless Browser"
              value={status.headlessDetected ? 'Detected!' : 'None'}
              valueClass={status.headlessDetected ? 'text-destructive' : 'text-emerald-600'}
            />
            <Row
              label="Honeypot Trips"
              value={status.honeypotTriggered ? 'Triggered!' : 'Clean'}
              valueClass={status.honeypotTriggered ? 'text-destructive' : 'text-emerald-600'}
            />
            <Row
              label="Blocked"
              value={String(status.blockedCount)}
              valueClass="text-foreground"
            />
          </div>

          <div className="mt-3 border-t border-border pt-3">
            <p className="text-xs font-semibold text-muted-foreground">
              ACTIVE DEFENSES
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {[
                'Bot Detection',
                'DOM Shield',
                'Honeypots',
                'Rate Limit',
                'CSP',
                'Behavior',
              ].map((defense) => (
                <span
                  key={defense}
                  className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                >
                  {defense}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
  )
}

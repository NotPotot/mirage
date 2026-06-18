'use client'

import { MirageProvider } from '@mirageshield/mirage/react'
import { ShieldStatusWidget } from './shield-status'
import type { ReactNode } from 'react'

export function ShieldWrapper({ children }: { children: ReactNode }) {
  return (
    <MirageProvider
      reportEndpoint="/api/mirage/report"
      protectSelectors={[
        '[data-sensitive]',
        'input[name="cardNumber"]',
        'input[name="cvv"]',
        'input[name="expiry"]',
      ]}
      honeypotFields={true}
      behaviorTracking={true}
    >
      {children}
      <ShieldStatusWidget />
    </MirageProvider>
  )
}

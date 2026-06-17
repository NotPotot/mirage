'use client'

import { CipherHacksProvider } from '@cipherhacks/shield/react'
import { ShieldStatusWidget } from './shield-status'
import type { ReactNode } from 'react'

export function ShieldWrapper({ children }: { children: ReactNode }) {
  return (
    <CipherHacksProvider
      reportEndpoint="/api/cipherhacks/report"
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
    </CipherHacksProvider>
  )
}

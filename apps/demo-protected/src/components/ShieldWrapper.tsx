'use client';

import { CipherHacksProvider } from 'cipherhacks-shield/react';
import { ShieldStatus } from './ShieldStatus';
import type { ReactNode } from 'react';

export function ShieldWrapper({ children }: { children: ReactNode }) {
  return (
    <CipherHacksProvider
      reportEndpoint="/api/cipherhacks/report"
      protectSelectors={['[data-sensitive]', '#card-number', '#card-cvv', '#card-expiry']}
      honeypotFields={true}
      behaviorTracking={true}
    >
      {children}
      <ShieldStatus />
    </CipherHacksProvider>
  );
}

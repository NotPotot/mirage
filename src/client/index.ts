import {
  createElement,
  useEffect,
  useRef,
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { detectHeadless, getHeadlessScore } from './headless-detect';
import { injectHoneypots } from './honeypot';
import { protectSensitiveFields } from './dom-shield';
import { createBehaviorTracker } from './behavior-tracker';
import type { ClientConfig } from '../types';
import { DEFAULT_CLIENT_CONFIG } from '../config';

interface ShieldStatus {
  active: boolean;
  threatScore: number;
  headlessDetected: boolean;
  honeypotTriggered: boolean;
  blockedCount: number;
}

const ShieldContext = createContext<ShieldStatus>({
  active: false,
  threatScore: 0,
  headlessDetected: false,
  honeypotTriggered: false,
  blockedCount: 0,
});

export function useShieldStatus(): ShieldStatus {
  return useContext(ShieldContext);
}

interface ProviderProps extends Partial<ClientConfig> {
  children: ReactNode;
  reportEndpoint?: string;
}

export function MirageProvider({
  children,
  reportEndpoint,
  protectSelectors = DEFAULT_CLIENT_CONFIG.protectSelectors,
  honeypotFields = DEFAULT_CLIENT_CONFIG.honeypotFields,
  behaviorTracking = DEFAULT_CLIENT_CONFIG.behaviorTracking,
}: ProviderProps) {
  const [status, setStatus] = useState<ShieldStatus>({
    active: false,
    threatScore: 0,
    headlessDetected: false,
    honeypotTriggered: false,
    blockedCount: 0,
  });
  const cleanupRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    const headlessSignals = detectHeadless();
    const headlessScore = getHeadlessScore(headlessSignals);
    const isHeadless = headlessScore > 30;

    if (isHeadless) {
      report(reportEndpoint, {
        type: 'headless',
        score: headlessScore,
        signals: headlessSignals,
      });
    }

    if (protectSelectors.length > 0) {
      cleanups.push(protectSensitiveFields(protectSelectors));
    }

    if (honeypotFields) {
      cleanups.push(
        injectHoneypots({
          onTriggered: (field) => {
            setStatus((s) => ({
              ...s,
              honeypotTriggered: true,
              blockedCount: s.blockedCount + 1,
            }));
            report(reportEndpoint, { type: 'honeypot', field });
          },
        })
      );
    }

    let tracker: ReturnType<typeof createBehaviorTracker> | null = null;
    if (behaviorTracking) {
      tracker = createBehaviorTracker();
      tracker.start();
      cleanups.push(() => tracker!.stop());
    }

    setStatus({
      active: true,
      threatScore: headlessScore,
      headlessDetected: isHeadless,
      honeypotTriggered: false,
      blockedCount: 0,
    });

    cleanupRef.current = cleanups;
    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return createElement(
    ShieldContext.Provider,
    { value: status },
    children
  );
}

function report(endpoint: string | undefined, data: unknown) {
  const url = endpoint || '/api/mirage/report';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data as object, url: window.location.href, timestamp: Date.now() }),
  }).catch(() => {});
}

export { detectHeadless, getHeadlessScore } from './headless-detect';
export { injectHoneypots, checkHoneypots } from './honeypot';
export { protectSensitiveFields, getRealValue } from './dom-shield';
export { createBehaviorTracker } from './behavior-tracker';
export { generateChallenge, solveChallenge, verifyChallenge } from './proof-of-work';

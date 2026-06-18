import { detectHeadless, getHeadlessScore } from './headless-detect';
import { injectHoneypots } from './honeypot';
import { protectSensitiveFields } from './dom-shield';
import { createBehaviorTracker } from './behavior-tracker';
import { generateChallenge, solveChallenge, verifyChallenge } from './proof-of-work';

export interface StandaloneConfig {
  /** CSS selectors for inputs/elements whose values should be masked from scrapers. */
  protectSelectors?: string[];
  /** Legacy single-selector alias. */
  protect?: string;
  /** Inject invisible honeypot fields into forms. Default: true */
  honeypotFields?: boolean;
  /** Legacy alias for honeypotFields. */
  honeypots?: boolean;
  /** Track mouse/keyboard behavior for human vs bot scoring. Default: true */
  behaviorTracking?: boolean;
  /** Legacy alias for behaviorTracking. */
  behavior?: boolean;
  /** URL to POST detection events to. Optional. */
  reportEndpoint?: string;
  /** Legacy alias for reportEndpoint. */
  report?: string;
  /** Headless score threshold above which a report is sent. Default: 30 */
  headlessThreshold?: number;
  /** Auto-initialize on DOMContentLoaded. Default: true */
  autoInit?: boolean;
}

export interface MirageInstance {
  destroy: () => void;
  headlessScore: number;
  headlessDetected: boolean;
  honeypotTriggered: boolean;
  blockedCount: number;
}

function normalize(config: StandaloneConfig): Required<
  Pick<
    StandaloneConfig,
    'protectSelectors' | 'honeypotFields' | 'behaviorTracking' | 'headlessThreshold'
  >
> & { reportEndpoint?: string } {
  const protectSelectors =
    config.protectSelectors ?? (config.protect ? [config.protect] : ['[data-sensitive]']);
  const honeypotFields = config.honeypotFields ?? config.honeypots ?? true;
  const behaviorTracking = config.behaviorTracking ?? config.behavior ?? true;
  const reportEndpoint = config.reportEndpoint ?? config.report;
  const headlessThreshold = config.headlessThreshold ?? 30;
  return { protectSelectors, honeypotFields, behaviorTracking, reportEndpoint, headlessThreshold };
}

function report(endpoint: string | undefined, data: unknown) {
  if (!endpoint || typeof fetch === 'undefined') return;
  try {
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(data as object),
        url: typeof window !== 'undefined' ? window.location.href : '',
        timestamp: Date.now(),
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* no-op */
  }
}

export function init(config: StandaloneConfig = {}): MirageInstance {
  const opts = normalize(config);
  const cleanups: Array<() => void> = [];

  const state: MirageInstance = {
    destroy: () => cleanups.forEach((fn) => fn()),
    headlessScore: 0,
    headlessDetected: false,
    honeypotTriggered: false,
    blockedCount: 0,
  };

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return state;
  }

  const headlessSignals = detectHeadless();
  const score = getHeadlessScore(headlessSignals);
  state.headlessScore = score;
  state.headlessDetected = score > opts.headlessThreshold;

  if (state.headlessDetected) {
    report(opts.reportEndpoint, {
      type: 'headless',
      score,
      signals: headlessSignals,
    });
  }

  if (opts.protectSelectors.length > 0) {
    cleanups.push(protectSensitiveFields(opts.protectSelectors));
  }

  if (opts.honeypotFields) {
    cleanups.push(
      injectHoneypots({
        onTriggered: (field) => {
          state.honeypotTriggered = true;
          state.blockedCount += 1;
          report(opts.reportEndpoint, { type: 'honeypot', field });
        },
      })
    );
  }

  if (opts.behaviorTracking) {
    const tracker = createBehaviorTracker();
    tracker.start();
    cleanups.push(() => tracker.stop());
  }

  return state;
}

/**
 * Read configuration from the <script> tag that loaded this bundle.
 * Supports either:
 *   <script src="mirage.js" data-config='{"honeypots":true}'></script>
 * or individual attributes:
 *   <script src="mirage.js" data-protect="[data-sensitive]" data-report="/api/report"></script>
 */
function readScriptConfig(): StandaloneConfig | null {
  if (typeof document === 'undefined') return null;
  const script =
    (document.currentScript as HTMLScriptElement | null) ||
    (document.querySelector('script[data-mirage]') as HTMLScriptElement | null);
  if (!script) return null;

  const jsonConfig = script.getAttribute('data-config');
  if (jsonConfig) {
    try {
      return JSON.parse(jsonConfig) as StandaloneConfig;
    } catch {
      /* fall through to attribute parsing */
    }
  }

  const cfg: StandaloneConfig = {};
  const protect = script.getAttribute('data-protect');
  if (protect) cfg.protectSelectors = protect.split(',').map((s) => s.trim()).filter(Boolean);
  const honeypots = script.getAttribute('data-honeypots');
  if (honeypots !== null) cfg.honeypotFields = honeypots !== 'false';
  const behavior = script.getAttribute('data-behavior');
  if (behavior !== null) cfg.behaviorTracking = behavior !== 'false';
  const reportUrl = script.getAttribute('data-report');
  if (reportUrl) cfg.reportEndpoint = reportUrl;
  const autoInit = script.getAttribute('data-auto-init');
  if (autoInit !== null) cfg.autoInit = autoInit !== 'false';
  return cfg;
}

let autoInstance: MirageInstance | null = null;

function autoInit() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const config = readScriptConfig();
  if (!config) return;
  if (config.autoInit === false) return;

  const run = () => {
    autoInstance = init(config);
    (window as unknown as { Mirage?: { instance?: MirageInstance } }).Mirage =
      (window as unknown as { Mirage?: Record<string, unknown> }).Mirage || {};
    (window as unknown as { Mirage: { instance?: MirageInstance } }).Mirage.instance = autoInstance;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
}

autoInit();

export {
  detectHeadless,
  getHeadlessScore,
  injectHoneypots,
  protectSensitiveFields,
  createBehaviorTracker,
  generateChallenge,
  solveChallenge,
  verifyChallenge,
};

export default { init, detectHeadless, getHeadlessScore, injectHoneypots, protectSensitiveFields, createBehaviorTracker, generateChallenge, solveChallenge, verifyChallenge };

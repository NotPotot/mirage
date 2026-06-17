import { detectHeadless, getHeadlessScore } from './headless-detect';
import { injectHoneypots } from './honeypot';
import { protectSensitiveFields } from './dom-shield';
import { createBehaviorTracker } from './behavior-tracker';

interface StandaloneConfig {
  protect?: string;
  honeypots?: boolean;
  behavior?: boolean;
  report?: string;
}

function init(config: StandaloneConfig = {}) {
  const cleanups: Array<() => void> = [];

  const headlessSignals = detectHeadless();
  const score = getHeadlessScore(headlessSignals);

  if (score > 30 && config.report) {
    fetch(config.report, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'headless',
        score,
        signals: headlessSignals,
        url: window.location.href,
      }),
    }).catch(() => {});
  }

  if (config.protect) {
    cleanups.push(protectSensitiveFields([config.protect]));
  }

  if (config.honeypots !== false) {
    cleanups.push(injectHoneypots());
  }

  if (config.behavior !== false) {
    const tracker = createBehaviorTracker();
    tracker.start();
    cleanups.push(() => tracker.stop());
  }

  return {
    destroy: () => cleanups.forEach((fn) => fn()),
    headlessScore: score,
  };
}

function autoInit() {
  const script = document.currentScript;
  if (!script) return;

  const configStr = script.getAttribute('data-config');
  if (configStr) {
    try {
      const config = JSON.parse(configStr);
      document.addEventListener('DOMContentLoaded', () => init(config));
    } catch {}
  }
}

autoInit();

export { init, detectHeadless, getHeadlessScore, injectHoneypots, protectSensitiveFields, createBehaviorTracker };

import { HEADLESS_WEBGL_RENDERERS } from '../shared/patterns';

export interface HeadlessSignals {
  webdriver: boolean;
  missingChrome: boolean;
  swiftShader: boolean;
  canvasAnomaly: boolean;
  cdpDetected: boolean;
  zeroOuterDimensions: boolean;
  automationFlags: boolean;
}

export function detectHeadless(): HeadlessSignals {
  const signals: HeadlessSignals = {
    webdriver: false,
    missingChrome: false,
    swiftShader: false,
    canvasAnomaly: false,
    cdpDetected: false,
    zeroOuterDimensions: false,
    automationFlags: false,
  };

  if (typeof navigator === 'undefined') return signals;

  signals.webdriver = !!(navigator as any).webdriver;

  const ua = navigator.userAgent || '';
  if (ua.includes('Chrome/') && !(window as any).chrome) {
    signals.missingChrome = true;
  }

  signals.swiftShader = checkWebGLRenderer();
  signals.canvasAnomaly = checkCanvasAnomaly();
  signals.cdpDetected = checkCDP();
  signals.zeroOuterDimensions =
    window.outerWidth === 0 && window.outerHeight === 0;
  signals.automationFlags = checkAutomationFlags();

  return signals;
}

function checkWebGLRenderer(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return false;
    const debugExt = (gl as WebGLRenderingContext).getExtension(
      'WEBGL_debug_renderer_info'
    );
    if (!debugExt) return false;
    const renderer = (gl as WebGLRenderingContext).getParameter(
      debugExt.UNMASKED_RENDERER_WEBGL
    );
    return HEADLESS_WEBGL_RENDERERS.some((pattern) =>
      renderer.includes(pattern)
    );
  } catch {
    return false;
  }
}

function checkCanvasAnomaly(): boolean {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Mirage', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Mirage', 4, 17);

    const dataUrl = canvas.toDataURL();
    // Extremely short data URLs suggest a blank or uniform canvas (headless anomaly)
    return dataUrl.length < 1000;
  } catch {
    return false;
  }
}

function checkCDP(): boolean {
  try {
    return !!(
      (window as any).__cdp_binding__ ||
      (window as any).__puppeteer_evaluation_script__ ||
      (window as any).__selenium_evaluate ||
      (window as any).__fxdriver_evaluate ||
      (window as any).__driver_evaluate ||
      (window as any).__webdriver_evaluate ||
      (window as any).__lastWatirAlert ||
      (window as any).__webdriver_script_fn ||
      (document as any).__webdriver_evaluate ||
      (document as any).__selenium_evaluate
    );
  } catch {
    return false;
  }
}

function checkAutomationFlags(): boolean {
  try {
    return !!(
      (navigator as any).webdriver ||
      (window as any)._phantom ||
      (window as any).__nightmare ||
      (window as any).callPhantom ||
      (window as any).domAutomation ||
      (window as any).domAutomationController
    );
  } catch {
    return false;
  }
}

export function getHeadlessScore(signals: HeadlessSignals): number {
  let score = 0;
  if (signals.webdriver) score += 40;
  if (signals.swiftShader) score += 30;
  if (signals.canvasAnomaly) score += 20;
  if (signals.cdpDetected) score += 35;
  if (signals.missingChrome) score += 15;
  if (signals.zeroOuterDimensions) score += 15;
  if (signals.automationFlags) score += 30;
  return Math.min(100, score);
}

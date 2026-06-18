export interface TypingAnalysis {
  avgKeystrokeInterval: number;
  keystrokeVariance: number;
  instantFields: number;
  superhuman: boolean;
  uniformTyping: boolean;
  fieldsFilledTooFast: string[];
}

export interface BehaviorProfile {
  mouseMovements: number;
  keystrokes: number;
  scrollEvents: number;
  touchEvents: number;
  timeSinceFirstInteraction: number;
  hasHumanLikePatterns: boolean;
  typing: TypingAnalysis;
}

interface FieldFillRecord {
  fieldId: string;
  startTime: number;
  endTime: number;
  charCount: number;
  intervals: number[];
}

interface InternalState {
  mousePositions: Array<{ x: number; y: number; t: number }>;
  keyTimings: number[];
  scrollTimings: number[];
  touchCount: number;
  firstInteraction: number | null;
  fieldFills: Map<string, FieldFillRecord>;
  activeField: string | null;
  activeFieldStart: number;
  activeFieldIntervals: number[];
  lastKeyTime: number;
}

export function createBehaviorTracker(): {
  start: () => void;
  stop: () => void;
  getProfile: () => BehaviorProfile;
  getScore: () => number;
} {
  const state: InternalState = {
    mousePositions: [],
    keyTimings: [],
    scrollTimings: [],
    touchCount: 0,
    firstInteraction: null,
    fieldFills: new Map(),
    activeField: null,
    activeFieldStart: 0,
    activeFieldIntervals: [],
    lastKeyTime: 0,
  };

  const recordFirstInteraction = () => {
    if (!state.firstInteraction) state.firstInteraction = Date.now();
  };

  const onMouseMove = (e: MouseEvent) => {
    recordFirstInteraction();
    state.mousePositions.push({ x: e.clientX, y: e.clientY, t: Date.now() });
    if (state.mousePositions.length > 100) state.mousePositions.shift();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    recordFirstInteraction();
    const now = Date.now();
    state.keyTimings.push(now);
    if (state.keyTimings.length > 50) state.keyTimings.shift();

    if (state.activeField && state.lastKeyTime > 0) {
      state.activeFieldIntervals.push(now - state.lastKeyTime);
    }
    state.lastKeyTime = now;
  };

  const onFocusIn = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') return;
    const fieldId = target.id || target.getAttribute('name') || `field-${Date.now()}`;
    state.activeField = fieldId;
    state.activeFieldStart = Date.now();
    state.activeFieldIntervals = [];
  };

  const onFocusOut = (e: FocusEvent) => {
    const target = e.target as HTMLInputElement;
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') return;
    if (!state.activeField) return;

    const fieldId = state.activeField;
    const charCount = (target.value || '').length;
    state.fieldFills.set(fieldId, {
      fieldId,
      startTime: state.activeFieldStart,
      endTime: Date.now(),
      charCount,
      intervals: [...state.activeFieldIntervals],
    });
    state.activeField = null;
    state.activeFieldIntervals = [];
  };

  const onScroll = () => {
    recordFirstInteraction();
    state.scrollTimings.push(Date.now());
    if (state.scrollTimings.length > 30) state.scrollTimings.shift();
  };

  const onTouch = () => {
    recordFirstInteraction();
    state.touchCount++;
  };

  return {
    start() {
      document.addEventListener('mousemove', onMouseMove, { passive: true });
      document.addEventListener('keydown', onKeyDown, { passive: true });
      document.addEventListener('scroll', onScroll, { passive: true });
      document.addEventListener('touchstart', onTouch, { passive: true });
      document.addEventListener('focusin', onFocusIn, { passive: true });
      document.addEventListener('focusout', onFocusOut, { passive: true });
    },

    stop() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('scroll', onScroll);
      document.removeEventListener('touchstart', onTouch);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    },

    getProfile(): BehaviorProfile {
      return {
        mouseMovements: state.mousePositions.length,
        keystrokes: state.keyTimings.length,
        scrollEvents: state.scrollTimings.length,
        touchEvents: state.touchCount,
        timeSinceFirstInteraction: state.firstInteraction
          ? Date.now() - state.firstInteraction
          : 0,
        hasHumanLikePatterns: detectHumanPatterns(state),
        typing: analyzeTyping(state),
      };
    },

    getScore(): number {
      const profile = this.getProfile();
      let score = 0;

      if (profile.mouseMovements === 0 && profile.touchEvents === 0) score += 15;
      if (profile.keystrokes === 0 && profile.timeSinceFirstInteraction > 5000)
        score += 10;
      if (!profile.hasHumanLikePatterns && profile.timeSinceFirstInteraction > 3000)
        score += 10;

      if (profile.typing.superhuman) score += 25;
      if (profile.typing.uniformTyping) score += 20;
      if (profile.typing.instantFields > 0) score += 30;

      return score;
    },
  };
}

function detectHumanPatterns(state: InternalState): boolean {
  if (state.mousePositions.length < 5) return false;

  let hasVariation = false;
  for (let i = 1; i < state.mousePositions.length; i++) {
    const dx = state.mousePositions[i].x - state.mousePositions[i - 1].x;
    const dy = state.mousePositions[i].y - state.mousePositions[i - 1].y;
    if (Math.abs(dx) !== Math.abs(dy) && dx !== 0 && dy !== 0) {
      hasVariation = true;
      break;
    }
  }

  if (state.keyTimings.length >= 3) {
    const intervals: number[] = [];
    for (let i = 1; i < state.keyTimings.length; i++) {
      intervals.push(state.keyTimings[i] - state.keyTimings[i - 1]);
    }
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance =
      intervals.reduce((sum, i) => sum + Math.pow(i - mean, 2), 0) /
      intervals.length;
    if (Math.sqrt(variance) > mean * 0.1) hasVariation = true;
  }

  return hasVariation;
}

function analyzeTyping(state: InternalState): TypingAnalysis {
  const fills = Array.from(state.fieldFills.values());
  const allIntervals = fills.flatMap((f) => f.intervals);

  let avgKeystrokeInterval = 0;
  let keystrokeVariance = 0;
  if (allIntervals.length > 1) {
    avgKeystrokeInterval =
      allIntervals.reduce((a, b) => a + b, 0) / allIntervals.length;
    keystrokeVariance =
      allIntervals.reduce(
        (sum, i) => sum + Math.pow(i - avgKeystrokeInterval, 2),
        0
      ) / allIntervals.length;
  }

  // Fields filled faster than 20ms per character are superhuman
  const fieldsFilledTooFast: string[] = [];
  let instantFields = 0;
  for (const fill of fills) {
    const duration = fill.endTime - fill.startTime;
    if (fill.charCount > 3) {
      const msPerChar = duration / fill.charCount;
      if (msPerChar < 20) {
        fieldsFilledTooFast.push(fill.fieldId);
      }
      if (duration < 50 && fill.charCount > 5) {
        instantFields++;
      }
    }
  }

  // Uniform typing: coefficient of variation < 0.1 across 5+ keystrokes
  const uniformTyping =
    allIntervals.length >= 5 &&
    avgKeystrokeInterval > 0 &&
    Math.sqrt(keystrokeVariance) / avgKeystrokeInterval < 0.1;

  // Superhuman: avg interval < 15ms (faster than any human can type)
  const superhuman = allIntervals.length >= 3 && avgKeystrokeInterval < 15;

  return {
    avgKeystrokeInterval,
    keystrokeVariance,
    instantFields,
    superhuman,
    uniformTyping,
    fieldsFilledTooFast,
  };
}

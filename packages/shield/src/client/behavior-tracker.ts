export interface BehaviorProfile {
  mouseMovements: number;
  keystrokes: number;
  scrollEvents: number;
  touchEvents: number;
  timeSinceFirstInteraction: number;
  hasHumanLikePatterns: boolean;
}

interface InternalState {
  mousePositions: Array<{ x: number; y: number; t: number }>;
  keyTimings: number[];
  scrollTimings: number[];
  touchCount: number;
  firstInteraction: number | null;
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
  };

  const recordFirstInteraction = () => {
    if (!state.firstInteraction) state.firstInteraction = Date.now();
  };

  const onMouseMove = (e: MouseEvent) => {
    recordFirstInteraction();
    state.mousePositions.push({ x: e.clientX, y: e.clientY, t: Date.now() });
    if (state.mousePositions.length > 100) state.mousePositions.shift();
  };

  const onKeyDown = () => {
    recordFirstInteraction();
    state.keyTimings.push(Date.now());
    if (state.keyTimings.length > 50) state.keyTimings.shift();
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
    },

    stop() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('scroll', onScroll);
      document.removeEventListener('touchstart', onTouch);
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

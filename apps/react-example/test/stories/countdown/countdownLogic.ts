export function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export type CountdownState = {
  durationMs: number;
  /** Wall time when the current run segment started; null when not running. */
  startTime: number | null;
  now: number;
  /** Elapsed time frozen from previous run segments (e.g. after pause). */
  frozenElapsedMs: number;
};

export type CountdownAction =
  | { type: "start"; now?: number }
  | { type: "pause"; now?: number }
  | { type: "reset"; now?: number }
  | { type: "tick"; now?: number };

export function elapsedMs(state: CountdownState): number {
  const runningElapsed =
    state.startTime === null ? 0 : Math.max(0, state.now - state.startTime);
  return state.frozenElapsedMs + runningElapsed;
}

export function remainingSeconds(state: CountdownState): number {
  const durationSeconds = Math.floor(state.durationMs / 1000);
  const elapsedSeconds = Math.floor(elapsedMs(state) / 1000);
  return Math.max(0, durationSeconds - elapsedSeconds);
}

export function initialCountdown(
  durationMinutes: number,
  now: number = Date.now(),
): CountdownState {
  return {
    durationMs: durationMinutes * 60 * 1000,
    startTime: null,
    now,
    frozenElapsedMs: 0,
  };
}

export function isComplete(state: CountdownState): boolean {
  return remainingSeconds(state) <= 0 && state.frozenElapsedMs >= state.durationMs;
}

export function countdownReducer(
  state: CountdownState,
  action: CountdownAction,
): CountdownState {
  const now = action.now ?? Date.now();

  switch (action.type) {
    case "start": {
      if (remainingSeconds(state) <= 0) {
        return state;
      }
      return { ...state, startTime: now, now };
    }
    case "pause": {
      if (state.startTime === null) {
        return state;
      }
      return {
        ...state,
        frozenElapsedMs: elapsedMs({ ...state, now }),
        startTime: null,
        now,
      };
    }
    case "reset": {
      return {
        durationMs: state.durationMs,
        startTime: null,
        now,
        frozenElapsedMs: 0,
      };
    }
    case "tick": {
      const next = { ...state, now };
      if (state.startTime !== null && remainingSeconds(next) <= 0) {
        return {
          ...next,
          startTime: null,
          frozenElapsedMs: state.durationMs,
        };
      }
      return next;
    }
  }
}

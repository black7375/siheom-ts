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

export function startCountdown(
  state: CountdownState,
  now: number = Date.now(),
): CountdownState {
  if (remainingSeconds(state) <= 0) {
    return state;
  }
  return { ...state, startTime: now, now };
}

export function pauseCountdown(
  state: CountdownState,
  now: number = Date.now(),
): CountdownState {
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

export function setNow(state: CountdownState, now: number): CountdownState {
  return { ...state, now };
}

import { FAKE_TIMER_USER_DELAY_MS } from "@siheom/core";
import { vi } from "vitest";

/**
 * Vue + user-event hang under fake timers unless timers also advance with
 * wall-clock time (`shouldAdvanceTime: true`). Explicit `effect.elapsed` still
 * jumps fake time for app timers.
 */
export const vueFakeTimerScope = {
  installFakeTimers: () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  },
  afterAction: async () => {
    await vi.advanceTimersByTimeAsync(FAKE_TIMER_USER_DELAY_MS);
  },
};

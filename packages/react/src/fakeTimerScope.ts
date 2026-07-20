import { act } from "@testing-library/react";
import { FAKE_TIMER_USER_DELAY_MS } from "@siheom/core";
import { vi } from "vitest";

/**
 * React + user-event hang under fake timers unless timers also advance with
 * wall-clock time (`shouldAdvanceTime: true`). Explicit `effect.elapsed` still
 * jumps fake time for app timers.
 */
export const reactFakeTimerScope = {
  installFakeTimers: () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  },
  afterAction: async () => {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(FAKE_TIMER_USER_DELAY_MS);
    });
  },
};

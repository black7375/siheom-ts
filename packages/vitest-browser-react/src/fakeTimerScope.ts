import { FAKE_TIMER_USER_DELAY_MS } from "@siheom/core";
import { vi } from "vitest";

export const reactFakeTimerScope = {
  installFakeTimers: () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  },
  afterAction: async () => {
    await vi.advanceTimersByTimeAsync(FAKE_TIMER_USER_DELAY_MS);
  },
};

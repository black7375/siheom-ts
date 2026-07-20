import { waitFor } from "@noma.to/qwik-testing-library";
import { vi } from "vitest";
import type { EffectStepDefinitionDict } from "@siheom/core";

export const qwikEffects = {
  elapsed: async (ms: number) => {
    await vi.advanceTimersByTimeAsync(ms);
    await waitFor(() => undefined);
  },
  runAllTimers: async () => {
    await vi.runAllTimersAsync();
    await waitFor(() => undefined);
  },
} satisfies EffectStepDefinitionDict;

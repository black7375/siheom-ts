import { vi } from "vitest";
import type { EffectStepDefinitionDict } from "@siheom/core";

export const solidEffects = {
  elapsed: async (ms: number) => {
    await vi.advanceTimersByTimeAsync(ms);
  },
  runAllTimers: async () => {
    await vi.runAllTimersAsync();
  },
} satisfies EffectStepDefinitionDict;

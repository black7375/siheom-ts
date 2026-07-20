import { vi } from "vitest";
import type { EffectStepDefinitionDict } from "../../core/src/types.ts";

export const reactNativeEffects = {
  elapsed: async (ms: number) => {
    await vi.advanceTimersByTimeAsync(ms);
  },
  runAllTimers: async () => {
    await vi.runAllTimersAsync();
  },
} satisfies EffectStepDefinitionDict;

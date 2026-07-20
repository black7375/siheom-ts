import { act } from "@testing-library/svelte";
import { vi } from "vitest";
import type { EffectStepDefinitionDict } from "@siheom/core";

export const svelteEffects = {
  elapsed: async (ms: number) => {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });
  },
  runAllTimers: async () => {
    await act(async () => {
      await vi.runAllTimersAsync();
    });
  },
} satisfies EffectStepDefinitionDict;

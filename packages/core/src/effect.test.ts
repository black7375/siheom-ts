import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { extendSiheom, overrideSiheom } from "./factory.ts";
import { defaultEffects } from "./effect.ts";
import { withFakeTimers } from "./withFakeTimers.ts";

describe("defaultEffects.elapsed", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("advances setTimeout callbacks", async () => {
    const fn = vi.fn();
    setTimeout(fn, 1_000);

    await defaultEffects.elapsed(1_000);

    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("defaultEffects.runAllTimers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("runs pending timers", async () => {
    const fn = vi.fn();
    setTimeout(fn, 5_000);

    await defaultEffects.runAllTimers();

    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("runSiheom effect steps", () => {
  it("runs an effect from the registry", async () => {
    let elapsedMs: number | null = null;

    const { runSiheom, effect: effectBindings } = overrideSiheom(
      {
        actions: {},
        assertions: {},
        givens: {},
        effects: {
          elapsed: async (_ms: number) => {},
        },
      },
      {
        effects: {
          elapsed: async (ms: number) => {
            elapsedMs = ms;
          },
        },
      },
    );

    await runSiheom(effectBindings.elapsed(500));

    expect(elapsedMs).toBe(500);
  });
});

describe("withFakeTimers", () => {
  it("advances timers scheduled inside the scope", async () => {
    const fn = vi.fn();

    const {
      runSiheom,
      given,
      effect: effectBindings,
    } = extendSiheom(
      {
        actions: {},
        assertions: {},
        givens: {},
        effects: defaultEffects,
      },
      {
        givens: {
          scheduleTimeout: async () => {
            setTimeout(fn, 1_000);
          },
        },
      },
    );

    await runSiheom(withFakeTimers(given.scheduleTimeout(), effectBindings.elapsed(1_000)));

    expect(fn).toHaveBeenCalledTimes(1);
  });
});

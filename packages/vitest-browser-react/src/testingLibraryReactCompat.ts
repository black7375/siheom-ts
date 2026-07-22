import { act as reactAct } from "react";
import {
  cleanup,
  render as vitestBrowserRender,
  type ComponentRenderOptions,
  type RenderResult,
} from "vitest-browser-react";

export { cleanup };
export type { ComponentRenderOptions, RenderResult };

/** @testing-library/react compatible `act` for vitest-browser-react setups. */
export const act = reactAct;

/** Async render — callers must `await render(...)`. */
export const render = vitestBrowserRender;

// try until fn succeeds until 1000ms timeout, if failed with error wait 50ms and retry
export const waitFor = async (
  fn: () => Promise<void>,
  options?: { timeout?: number; interval?: number },
) => {
  const timeout = options?.timeout ?? 1000;
  const interval = options?.interval ?? 50;
  let error: unknown;
  for (let i = 0; i < timeout / interval; i++) {
    try {
      await fn();
      return;
    } catch (err) {
      error = err;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw error;
};

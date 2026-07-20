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

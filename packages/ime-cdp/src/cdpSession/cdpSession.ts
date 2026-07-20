import { cdp } from "vitest/browser";

/**
 * Minimal CDP send surface used by ime-cdp.
 * Compatible with Vitest browser `cdp().send(method, params)`.
 */
export type CdpSend = (method: string, params?: Record<string, unknown>) => Promise<unknown>;

export type CdpSessionLike = {
  send: CdpSend;
};

/** Resolve Vitest browser CDP session (`vitest/browser` `cdp()`). Chromium + Playwright only. */
export function getVitestCdpSession(): CdpSend {
  const session = cdp() as CdpSessionLike;
  return (method, params) => session.send(method, params);
}

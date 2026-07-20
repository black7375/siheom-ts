import type { ComposedEventRecord } from "@siheom/ime";

export type ChromiumCdpTraceSource = "cdp";

export type ChromiumCdpTrace = {
  profileId: "chromium-cdp";
  os: string;
  browser: "chromium";
  ime: "cdp";
  capturedAt: string;
  scenarioId: string;
  source: ChromiumCdpTraceSource;
  events: ComposedEventRecord[];
};

export function buildChromiumCdpTrace(meta: {
  scenarioId: string;
  events: ComposedEventRecord[];
  os?: string;
  capturedAt?: string;
}): ChromiumCdpTrace {
  return {
    profileId: "chromium-cdp",
    os: meta.os ?? "any",
    browser: "chromium",
    ime: "cdp",
    capturedAt: meta.capturedAt ?? new Date().toISOString(),
    scenarioId: meta.scenarioId,
    source: "cdp",
    events: meta.events,
  };
}

export type CriticalEvent = {
  type: string;
  key: string | null;
  code: string | null;
  keyCode: number | null;
  isComposing: boolean | null;
  inputType: string | null;
  data: string | null;
  value: string;
};

export type CriticalTraceDiff = {
  index: number;
  left?: CriticalEvent;
  right?: CriticalEvent;
};

/** Structural diff of critical event lists (informational ATDD helper — not a CI gate). */
export function diffCriticalTraces(
  left: CriticalEvent[],
  right: CriticalEvent[],
): CriticalTraceDiff[] {
  const diffs: CriticalTraceDiff[] = [];
  const len = Math.max(left.length, right.length);
  for (let i = 0; i < len; i++) {
    const a = left[i];
    const b = right[i];
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      diffs.push({ index: i, left: a, right: b });
    }
  }
  return diffs;
}

import { describe, expect, it } from "vitest";
import { attachImeRecorder, toCriticalEvents } from "@siheom/ime";

import { composeHangulCdp } from "../composeHangulCdp";
import { buildChromiumCdpTrace, diffCriticalTraces } from "./atdd";

describe("ATDD helpers", () => {
  it("buildChromiumCdpTrace sets profileId chromium-cdp and source cdp", async () => {
    const input = document.createElement("input");
    document.body.append(input);
    const { events, detach } = attachImeRecorder(input);
    await composeHangulCdp(input, "김");

    const trace = buildChromiumCdpTrace({ scenarioId: "kim", events });
    expect(trace).toMatchObject({
      profileId: "chromium-cdp",
      browser: "chromium",
      ime: "cdp",
      source: "cdp",
      scenarioId: "kim",
    });
    expect(trace.events.length).toBeGreaterThan(0);

    detach();
    input.remove();
  });

  it("diffCriticalTraces reports mismatches without throwing", async () => {
    const input = document.createElement("input");
    document.body.append(input);
    const { events, detach } = attachImeRecorder(input);
    await composeHangulCdp(input, "김");
    const critical = toCriticalEvents(events);

    const same = diffCriticalTraces(critical, critical);
    expect(same).toEqual([]);

    const different = diffCriticalTraces(critical, critical.slice(0, -1));
    expect(different.length).toBeGreaterThan(0);
    expect(different[0]?.index).toBe(critical.length - 1);

    detach();
    input.remove();
  });
});

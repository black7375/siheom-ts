import { describe, expect, it } from "vitest";

import { dualTraceFromImeCapture } from "./dualTraceFromImeCapture";
import brokenGaGolden from "../../fixtures/android-firefox-slate-placeholder-broken/first-hangul-가.json";

describe("dualTraceFromImeCapture", () => {
  it("maps each event value to expectedDom", () => {
    const dual = dualTraceFromImeCapture(brokenGaGolden);
    expect(dual.steps.length).toBe(brokenGaGolden.events.length);
    expect(dual.steps[4]?.expectedDom).toBe(brokenGaGolden.events[4]?.value);
  });
});

import { describe, expect, it } from "vitest";
import { measureReplayFidelity } from "@siheom/ime";

import { dualTraceFromImeCapture } from "@siheom/ime";
import brokenGaGolden from "./fixtures/android-firefox/broken-가-placeholder.json";
import { readSlatePlainText } from "./readSlatePlainText";

/**
 * Experiment B — dual trace separates events from expected DOM.
 * Oracle writeback should hit 100%; events-only Slate stays low (see Experiment A).
 */
describe("Experiment B: dual-trace oracle vs events-only", () => {
  it("dual trace step count matches raw capture", () => {
    const dual = dualTraceFromImeCapture(brokenGaGolden);
    expect(dual.steps).toHaveLength(brokenGaGolden.events.length);
  });

  it("oracle replay on plain div satisfies dual trace expectedDom", async () => {
    const dual = dualTraceFromImeCapture(brokenGaGolden);
    const div = document.createElement("div");
    div.contentEditable = "true";
    document.body.append(div);

    const report = await measureReplayFidelity(
      div,
      dual.steps.map((step) => step.event),
      readSlatePlainText,
      { settle: "macrotask", writeback: "golden" },
    );

    expect(report.matchRate).toBe(1);
    div.remove();
  });
});

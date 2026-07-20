import { describe, expect, it } from "vitest";

import { CAPTURE_SCENARIOS, getCaptureScenario } from "./scenarios.ts";

describe("CAPTURE_SCENARIOS", () => {
  it("covers continuous, mixed, backspace, and arrow-edit drills", () => {
    expect(CAPTURE_SCENARIOS.map((s) => s.id)).toEqual([
      "continuous-hangul",
      "mixed-en-ko",
      "backspace-mid",
      "arrow-edit-mid",
      "maxlength-overflow",
    ]);
  });

  it("each scenario has steps, expected value, and a userEventScript", () => {
    for (const scenario of CAPTURE_SCENARIOS) {
      expect(scenario.title.length).toBeGreaterThan(0);
      expect(scenario.steps.length).toBeGreaterThan(0);
      expect(scenario.expectedValue.length).toBeGreaterThan(0);
      expect(scenario.userEventScript.length).toBeGreaterThan(0);
    }
  });

  it("looks up a scenario by id", () => {
    expect(getCaptureScenario("mixed-en-ko")?.expectedValue).toBe("hello 안녕");
  });
});

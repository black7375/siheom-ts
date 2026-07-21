import { describe, expect, it } from "vitest";

import { planHangulKeystrokes, withSuffix } from "./planHangulKeystrokes";

describe("withSuffix", () => {
  it("returns new strokes with suffix appended to valuesAfterSteps", () => {
    const strokes = planHangulKeystrokes("가");
    const withTail = withSuffix(strokes, "X");

    expect(withTail).not.toBe(strokes);
    expect(withTail[0]?.valuesAfterSteps).toEqual(
      strokes[0]?.valuesAfterSteps.map((value) => value + "X"),
    );
    expect(strokes[0]?.valuesAfterSteps.every((value) => !value.endsWith("X"))).toBe(true);
  });

  it("copies values even when suffix is empty", () => {
    const strokes = planHangulKeystrokes("나");
    const copied = withSuffix(strokes, "");
    expect(copied[0]?.valuesAfterSteps).toEqual(strokes[0]?.valuesAfterSteps);
    expect(copied[0]?.valuesAfterSteps).not.toBe(strokes[0]?.valuesAfterSteps);
  });
});

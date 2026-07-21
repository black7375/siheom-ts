import { describe, expect, it } from "vitest";

import { planHangulKeystrokes, withSuffix } from "./planHangulKeystrokes";

describe("planHangulKeystrokes", () => {
  it("run boundary keeps one composition with continuous preedit for 김태", () => {
    const strokes = planHangulKeystrokes("김태", { compositionBoundary: "run" });

    expect(strokes.every((stroke) => stroke.commitAfterFirstStep === undefined)).toBe(true);
    expect(strokes.filter((stroke) => stroke.compositionStart)).toHaveLength(1);
    expect(strokes.map((stroke) => stroke.preeditSteps[0])).toEqual([
      "ㄱ",
      "기",
      "김",
      "김ㅌ",
      "김태",
    ]);
  });
});

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

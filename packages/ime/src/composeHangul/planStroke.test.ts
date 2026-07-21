import { describe, expect, it } from "vitest";

import { decideSafariOverflow, decideStrokeStepOutcome } from "./planStroke";

describe("decideStrokeStepOutcome", () => {
  it("prefers deferred when writeback or clobber", () => {
    expect(
      decideStrokeStepOutcome({
        plannedValue: "김",
        domValue: "김",
        blurred: true,
        writeback: true,
      }),
    ).toBe("aborted-deferred");
    expect(
      decideStrokeStepOutcome({
        plannedValue: "김",
        domValue: "",
        blurred: false,
        writeback: false,
      }),
    ).toBe("aborted-deferred");
  });

  it("reports blur when only blurred", () => {
    expect(
      decideStrokeStepOutcome({
        plannedValue: "김",
        domValue: "김",
        blurred: true,
        writeback: false,
      }),
    ).toBe("aborted-blur");
  });

  it("ok when stable", () => {
    expect(
      decideStrokeStepOutcome({
        plannedValue: "김",
        domValue: "김",
        blurred: false,
        writeback: false,
      }),
    ).toBe("ok");
  });
});

describe("decideSafariOverflow", () => {
  it("returns null under limit", () => {
    expect(
      decideSafariOverflow({ maxLength: 3, plannedValue: "김", domValue: "김" }),
    ).toBeNull();
  });

  it("detects host clamp", () => {
    expect(
      decideSafariOverflow({ maxLength: 1, plannedValue: "가나", domValue: "가" }),
    ).toEqual({ hostClamped: true, clamped: "가" });
  });
});

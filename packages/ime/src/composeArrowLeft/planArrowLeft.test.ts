import { describe, expect, it } from "vitest";

import { planArrowLeft } from "./planArrowLeft";

describe("planArrowLeft", () => {
  it("moves caret left when not composing", () => {
    const steps = planArrowLeft({
      composing: false,
      caret: 2,
      value: "ab",
      confirmFacts: { valueBefore: "ab", maxLength: null },
    });
    expect(steps.map((s) => s.kind)).toEqual(["keydown", "setValue", "keyup"]);
    expect(steps[1]).toMatchObject({ value: "ab", caret: 1 });
  });

  it("confirms composition before moving caret", () => {
    const steps = planArrowLeft({
      composing: true,
      session: {
        composing: true,
        committed: "",
        preedit: "김",
        suffix: "",
      },
      caret: 1,
      value: "김",
      confirmFacts: { valueBefore: "김", maxLength: null },
    });
    expect(steps.some((s) => s.kind === "compositionend")).toBe(true);
    const move = [...steps].reverse().find((s) => s.kind === "setValue");
    expect(move).toMatchObject({ caret: 0 });
  });
});

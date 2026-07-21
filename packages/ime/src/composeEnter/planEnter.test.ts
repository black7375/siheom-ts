import { describe, expect, it } from "vitest";

import { planEnter } from "./planEnter";

const session = {
  composing: true,
  committed: "",
  preedit: "김",
  suffix: "",
} as const;

const confirmFacts = { valueBefore: "김", maxLength: null };

describe("planEnter", () => {
  it("plans plain Enter when not composing", () => {
    expect(
      planEnter({
        composing: false,
        facet: "webkit",
        confirmFacts,
      }).map((s) => s.kind),
    ).toEqual(["keydown", "keyup"]);
  });

  it("webkit: confirm then Enter", () => {
    const kinds = planEnter({
      composing: true,
      facet: "webkit",
      session: { ...session },
      confirmFacts,
    }).map((s) => s.kind);

    const end = kinds.indexOf("compositionend");
    const enter = kinds.indexOf("keydown", end);
    expect(end).toBeGreaterThan(-1);
    expect(enter).toBeGreaterThan(end);
  });

  it("chromium: Process keydown before confirm", () => {
    const steps = planEnter({
      composing: true,
      facet: "chromium",
      session: { ...session },
      confirmFacts,
    });
    expect(steps[0]).toMatchObject({
      kind: "keydown",
      fields: { key: "Process", keyCode: 229 },
    });
    expect(steps.some((s) => s.kind === "compositionend")).toBe(true);
  });
});

import { describe, expect, it } from "vitest";

import { planBackspace } from "./planBackspace";

describe("planBackspace", () => {
  it("plans deleteContentBackward when not composing", () => {
    const steps = planBackspace({
      composing: false,
      value: "ab",
      selectionStart: 2,
      selectionEnd: 2,
      valueBefore: "ab",
      maxLength: null,
    });

    expect(steps.map((s) => s.kind)).toEqual([
      "keydown",
      "beforeinput",
      "setValue",
      "input",
      "keyup",
    ]);
    expect(steps.find((s) => s.kind === "setValue")).toMatchObject({
      value: "a",
      caret: 1,
    });
  });

  it("plans compositionend when composing preedit shrinks to empty", () => {
    const steps = planBackspace({
      composing: true,
      session: {
        composing: true,
        committed: "김",
        preedit: "ㄱ",
        suffix: "",
      },
      value: "김ㄱ",
      selectionStart: 2,
      selectionEnd: 2,
      valueBefore: "김ㄱ",
      maxLength: null,
    });

    expect(steps.some((s) => s.kind === "compositionend")).toBe(true);
    expect(steps.some((s) => s.kind === "clearSession")).toBe(true);
  });
});

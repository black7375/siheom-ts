import { describe, expect, it } from "vitest";

import { planHanjaConfirm, planHanjaConversion } from "./planHanja";

describe("planHanjaConversion", () => {
  it("append mode sets session with hangul+hanja committed split", () => {
    const steps = planHanjaConversion({
      mode: "append",
      hangul: "김",
      hanja: "金",
      bounds: { prefix: "", suffix: "" },
      facts: { valueBefore: "김", maxLength: null },
    });
    const session = steps.find((s) => s.kind === "setSession");
    expect(session).toMatchObject({
      session: { committed: "김", preedit: "金" },
    });
  });

  it("replace mode uses insertFromComposition", () => {
    const steps = planHanjaConversion({
      mode: "replace",
      hangul: "김",
      hanja: "金",
      bounds: { prefix: "", suffix: "" },
      facts: { valueBefore: "김", maxLength: null },
    });
    expect(
      steps.some(
        (s) => s.kind === "beforeinput" && s.fields.inputType === "insertFromComposition",
      ),
    ).toBe(true);
  });
});

describe("planHanjaConfirm", () => {
  it("append confirm ends with settled hanja-only value", () => {
    const steps = planHanjaConfirm({
      mode: "append",
      hangul: "김",
      hanja: "金",
      committedPrefix: "",
      suffix: "",
      appendedValue: "김金",
      facts: { valueBefore: "김金", maxLength: null },
    });
    expect(steps.some((s) => s.kind === "compositionend")).toBe(true);
    const settle = [...steps].reverse().find((s) => s.kind === "setValue");
    expect(settle).toMatchObject({
      value: "金",
      caret: 1,
    });
  });
});

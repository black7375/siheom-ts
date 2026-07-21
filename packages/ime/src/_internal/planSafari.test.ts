import { describe, expect, it } from "vitest";

import {
  planChromeCompositionOverflow,
  planSafariCompositionOverflow,
} from "./planMaxLength";
import { planSafariInsertFromComposition } from "./planSafari";

describe("planChromeCompositionOverflow", () => {
  it("uses empty input data then compositionend", () => {
    const steps = planChromeCompositionOverflow("가", "가나", 2);
    const input = steps.find((s) => s.kind === "input");
    expect(input).toMatchObject({
      fields: { data: "", inputType: "insertCompositionText" },
    });
    expect(steps.some((s) => s.kind === "compositionend")).toBe(true);
    expect(steps.some((s) => s.kind === "clearSession")).toBe(true);
  });
});

describe("planSafariCompositionOverflow", () => {
  it("inserts empty string via insertFromComposition", () => {
    const steps = planSafariCompositionOverflow("가", "가나", 2);
    const insert = steps.filter(
      (s) => s.kind === "beforeinput" && s.fields.inputType === "insertFromComposition",
    );
    expect(insert[0]).toMatchObject({ fields: { data: "" } });
  });
});

describe("planSafariInsertFromComposition", () => {
  it("clears then re-inserts the syllable", () => {
    const steps = planSafariInsertFromComposition("김", "김");
    expect(steps.map((s) => s.kind)).toEqual([
      "beforeinput",
      "setValue",
      "input",
      "beforeinput",
      "setValue",
      "input",
    ]);
    expect(steps[1]).toMatchObject({ kind: "setValue", value: "", caret: 0 });
    expect(steps[4]).toMatchObject({ kind: "setValue", value: "김", caret: 1 });
  });
});

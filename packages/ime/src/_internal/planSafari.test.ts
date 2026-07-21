import { describe, expect, it } from "vitest";

import { planChromeCompositionOverflow, planSafariCompositionOverflow } from "./planMaxLength";
import {
  planSafariInsertFromComposition,
  planSafariSyllableCommit,
  planRestartSafariComposition,
} from "./planSafari";
import { replacementInputType } from "./replacementInputType";

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

describe("planSafariSyllableCommit", () => {
  it("echoes preedit then delete/insertFromComposition and compositionend", () => {
    const steps = planSafariSyllableCommit("김", "김", {
      valueBefore: "김",
      maxLength: null,
    });
    expect(steps.some((s) => s.kind === "compositionupdate")).toBe(true);
    expect(
      steps.some((s) => s.kind === "beforeinput" && s.fields.inputType === "deleteCompositionText"),
    ).toBe(true);
    expect(steps.at(-1)).toMatchObject({ kind: "compositionend", data: "김" });
  });
});

describe("planRestartSafariComposition", () => {
  it("emits compositionstart", () => {
    expect(planRestartSafariComposition()).toEqual([{ kind: "compositionstart" }]);
  });
});

describe("replacementInputType", () => {
  it("detects append vs replacement", () => {
    expect(replacementInputType("김", "김태", "태")).toBe("insertText");
    expect(replacementInputType("김", "김", "김")).toBe("insertReplacementText");
    expect(replacementInputType("가", "나", "나")).toBe("insertReplacementText");
  });
});

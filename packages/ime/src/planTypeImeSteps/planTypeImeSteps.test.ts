import { describe, expect, it } from "vitest";

import { planTypeImeSteps } from "./planTypeImeSteps.ts";

describe("planTypeImeSteps", () => {
  it("plans plain Hangul with commitFinal true", () => {
    expect(planTypeImeSteps("김태희")).toEqual([
      { kind: "hangul", text: "김태희", commitFinal: true },
    ]);
  });

  it("leaves Hangul open before Backspace, ArrowLeft, or Enter keys", () => {
    expect(planTypeImeSteps("김{Backspace}")).toEqual([
      { kind: "hangul", text: "김", commitFinal: false },
      { kind: "keys", text: "{Backspace}" },
    ]);
    expect(planTypeImeSteps("김{ArrowLeft}")).toEqual([
      { kind: "hangul", text: "김", commitFinal: false },
      { kind: "keys", text: "{ArrowLeft}" },
    ]);
    expect(planTypeImeSteps("안녕{Enter}")).toEqual([
      { kind: "hangul", text: "안녕", commitFinal: false },
      { kind: "keys", text: "{Enter}" },
    ]);
  });

  it("keeps commitFinal true when next keys are not edit/Enter descriptors", () => {
    expect(planTypeImeSteps("안녕!")).toEqual([
      { kind: "hangul", text: "안녕", commitFinal: true },
      { kind: "keys", text: "!" },
    ]);
  });

  it("plans mixed Latin and Hangul segments", () => {
    expect(planTypeImeSteps("hello 안녕{Enter}")).toEqual([
      { kind: "keys", text: "hello " },
      { kind: "hangul", text: "안녕", commitFinal: false },
      { kind: "keys", text: "{Enter}" },
    ]);
  });

  it("plans keys-only text as a single keys step", () => {
    expect(planTypeImeSteps("hello{Enter}")).toEqual([{ kind: "keys", text: "hello{Enter}" }]);
  });
});

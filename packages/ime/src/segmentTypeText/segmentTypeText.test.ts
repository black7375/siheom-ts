import { describe, expect, it } from "vitest";

import { segmentTypeText } from "./segmentTypeText.ts";

describe("segmentTypeText", () => {
  it("keeps a Hangul run as one compose segment", () => {
    expect(segmentTypeText("김태희")).toEqual([{ kind: "hangul", text: "김태희" }]);
  });

  it("splits Latin, Hangul, and key descriptors", () => {
    expect(segmentTypeText("hello 안녕{Enter}")).toEqual([
      { kind: "keys", text: "hello " },
      { kind: "hangul", text: "안녕" },
      { kind: "keys", text: "{Enter}" },
    ]);
  });
});

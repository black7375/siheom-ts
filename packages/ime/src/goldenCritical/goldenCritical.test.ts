import { describe, expect, it } from "vitest";

import { fromFirstCompositionStart } from "./goldenCritical";

describe("fromFirstCompositionStart", () => {
  it("returns the original list when there is no compositionstart", () => {
    const events = [
      { type: "keydown", key: "a" },
      { type: "input", value: "a" },
    ];

    expect(fromFirstCompositionStart(events)).toEqual(events);
  });
});

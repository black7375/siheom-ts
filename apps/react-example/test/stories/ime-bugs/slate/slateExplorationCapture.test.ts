import { describe, expect, it } from "vitest";

import { divergenceFlags, buildSourceMapHints } from "./slateExplorationCapture";
import brokenGate from "./fixtures/android-firefox/device-alt-gate-broken-가나다.json";

describe("slateExplorationCapture", () => {
  it("builds source map hints for first events (H3)", () => {
    const hints = buildSourceMapHints(brokenGate.events, 5);
    expect(hints).toHaveLength(5);
    expect(hints[0]?.handlers.some((h) => h.includes("onKeyDown"))).toBe(true);
    expect(hints.find((h) => h.type === "beforeinput")?.handlers.length).toBeGreaterThan(0);
  });

  it("flags stuck-ㄱ when compositionupdate data is 가 but dom is ㄱ", () => {
    expect(
      divergenceFlags(
        {
          type: "compositionupdate",
          key: null,
          code: null,
          keyCode: null,
          isComposing: null,
          inputType: null,
          data: "가",
          value: "ㄱ",
        },
        { slateText: "ㄱ", domText: "ㄱ" },
      ),
    ).toContain("stuck-ㄱ-while-data-가");
  });

  it("flags compositionend.data≠domText for orphan ㄱ가나다", () => {
    const flags = divergenceFlags(
      {
        type: "compositionend",
        key: null,
        code: null,
        keyCode: null,
        isComposing: null,
        inputType: null,
        data: "가나다",
        value: "ㄱ가나다",
      },
      { slateText: "ㄱ가나다", domText: "ㄱ가나다" },
    );
    expect(flags).toContain("compositionend.data≠domText");
  });
});

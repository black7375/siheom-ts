import { describe, expect, it } from "vitest";

import {
  isImeProcessKey,
  scenarioIdForFixMode,
  usesCompositionAnchor,
  usesForceRenderGuard,
  usesPlaceholderHideWhileComposing,
} from "./slatePlaceholderAlternatives";

describe("slatePlaceholderAlternatives", () => {
  it("detects IME Process keydown", () => {
    expect(isImeProcessKey({ key: "Process", keyCode: 229 })).toBe(true);
    expect(isImeProcessKey({ key: "a", keyCode: 65 })).toBe(false);
  });

  it("maps alternative capabilities", () => {
    expect(usesCompositionAnchor("alt-a")).toBe(true);
    expect(usesCompositionAnchor("alt-b")).toBe(false);
    expect(usesCompositionAnchor("alt-c")).toBe(true);

    expect(usesForceRenderGuard("alt-a")).toBe(false);
    expect(usesForceRenderGuard("alt-b")).toBe(true);
    expect(usesForceRenderGuard("alt-c")).toBe(true);

    expect(usesPlaceholderHideWhileComposing("alt-a")).toBe(false);
    expect(usesPlaceholderHideWhileComposing("alt-b")).toBe(true);
    expect(usesPlaceholderHideWhileComposing("alt-c")).toBe(true);
  });

  it("assigns scenario ids per mode", () => {
    expect(scenarioIdForFixMode("broken")).toBe("slate-ac-first-hangul-placeholder");
    expect(scenarioIdForFixMode("alt-a")).toContain("alt-a");
    expect(scenarioIdForFixMode("alt-c")).toContain("alt-c");
  });
});

import { describe, expect, it } from "vitest";

import {
  DEFAULT_IME_PROFILE_ID,
  getRegisteredProfileIds,
  registerProfile,
  resolveProfile,
} from "./profiles";

describe("IME profiles", () => {
  it("resolves linux-chrome-ibus-hangul as the default built-in", () => {
    expect(resolveProfile().id).toBe(DEFAULT_IME_PROFILE_ID);
    // OS capture: Enter confirm is compositionend → Enter(isComposing:false), same as Safari
    expect(resolveProfile("linux-chrome-ibus-hangul").enterDuringComposition).toBe("webkit");
  });

  it("resolves macos-safari with webkit Enter-during-composition order", () => {
    expect(resolveProfile("macos-safari").enterDuringComposition).toBe("webkit");
  });

  it("registerProfile adds a custom profile resolvable by id", () => {
    registerProfile({
      id: "test-custom-ime",
      enterDuringComposition: "chromium-duplicate",
      hangulKeyEventKey: "process",
      hangulComposeMode: "composition",
    });
    expect(resolveProfile("test-custom-ime").enterDuringComposition).toBe("chromium-duplicate");
    expect(getRegisteredProfileIds()).toContain("test-custom-ime");
  });

  it("resolves macos-safari-apple with replacement Hangul and jamo keys", () => {
    expect(resolveProfile("macos-safari-apple")).toMatchObject({
      hangulComposeMode: "replacement",
      hangulKeyEventKey: "jamo",
      enterDuringComposition: "webkit",
    });
  });

  it("resolves macos-chrome-apple with chromium-apple Enter and jamo keydown keys", () => {
    expect(resolveProfile("macos-chrome-apple")).toMatchObject({
      enterDuringComposition: "chromium-apple",
      hangulKeyEventKey: "jamo",
      hangulComposeMode: "composition",
    });
  });

  it("resolves chromium-cdp with composition Hangul and process keys", () => {
    expect(resolveProfile("chromium-cdp")).toMatchObject({
      enterDuringComposition: "chromium",
      hangulKeyEventKey: "process",
      hangulComposeMode: "composition",
    });
  });

  it("throws for unknown profile ids", () => {
    expect(() => resolveProfile("not-a-real-profile")).toThrow(/Unknown IME profile/);
  });
});

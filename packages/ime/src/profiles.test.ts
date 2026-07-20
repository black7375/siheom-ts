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
    expect(resolveProfile("linux-chrome-ibus-hangul").enterDuringComposition).toBe(
      "chromium",
    );
  });

  it("resolves macos-safari with webkit Enter-during-composition order", () => {
    expect(resolveProfile("macos-safari").enterDuringComposition).toBe("webkit");
  });

  it("registerProfile adds a custom profile resolvable by id", () => {
    registerProfile({
      id: "test-custom-ime",
      enterDuringComposition: "chromium-duplicate",
    });
    expect(resolveProfile("test-custom-ime").enterDuringComposition).toBe(
      "chromium-duplicate",
    );
    expect(getRegisteredProfileIds()).toContain("test-custom-ime");
  });

  it("throws for unknown profile ids", () => {
    expect(() => resolveProfile("not-a-real-profile")).toThrow(/Unknown IME profile/);
  });
});

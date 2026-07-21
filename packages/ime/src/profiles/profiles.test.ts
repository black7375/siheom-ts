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
      hanjaConversion: "replace",
      hangulCompositionBoundary: "syllable",
    });
    expect(resolveProfile("test-custom-ime").enterDuringComposition).toBe("chromium-duplicate");
    expect(getRegisteredProfileIds()).toContain("test-custom-ime");
  });

  it("resolves macos-safari-apple with replacement Hangul and jamo keys", () => {
    expect(resolveProfile("macos-safari-apple")).toMatchObject({
      hangulComposeMode: "replacement",
      hangulKeyEventKey: "jamo",
      enterDuringComposition: "webkit",
      hanjaConversion: "replace",
    });
  });

  it("resolves macos-chrome-apple with chromium-apple Enter, jamo keys, and append Hanja", () => {
    expect(resolveProfile("macos-chrome-apple")).toMatchObject({
      enterDuringComposition: "chromium-apple",
      hangulKeyEventKey: "jamo",
      hangulComposeMode: "composition",
      hanjaConversion: "append",
    });
  });

  it("resolves chromium-cdp with composition Hangul and process keys", () => {
    expect(resolveProfile("chromium-cdp")).toMatchObject({
      enterDuringComposition: "chromium",
      hangulKeyEventKey: "process",
      hangulComposeMode: "composition",
      hanjaConversion: "replace",
    });
  });

  it("defaults linux Hangul profile to replace Hanja conversion", () => {
    expect(resolveProfile("linux-chrome-ibus-hangul").hanjaConversion).toBe("replace");
  });

  it("defaults existing Hangul profiles to syllable composition boundary", () => {
    expect(resolveProfile("linux-chrome-ibus-hangul").hangulCompositionBoundary).toBe("syllable");
    expect(resolveProfile("macos-chrome-apple").hangulCompositionBoundary).toBe("syllable");
  });

  it("resolves android-chrome with webkit Enter, unidentified keys, and run boundary", () => {
    expect(resolveProfile("android-chrome")).toMatchObject({
      enterDuringComposition: "webkit",
      hangulKeyEventKey: "unidentified",
      hangulComposeMode: "composition",
      hanjaConversion: "replace",
      hangulCompositionBoundary: "run",
    });
  });

  it("resolves android-chrome-slate-placeholder-broken with golden replay compose mode", () => {
    expect(resolveProfile("android-chrome-slate-placeholder-broken")).toMatchObject({
      hangulComposeMode: "android-chrome-slate-placeholder-broken",
      hangulKeyEventKey: "unidentified",
    });
  });

  it("resolves android-chrome-slate-plain-control with golden replay compose mode", () => {
    expect(resolveProfile("android-chrome-slate-plain-control")).toMatchObject({
      hangulComposeMode: "android-chrome-slate-plain-control",
      hangulKeyEventKey: "unidentified",
    });
  });

  it("resolves android-firefox-slate-placeholder-broken with golden replay compose mode", () => {
    expect(resolveProfile("android-firefox-slate-placeholder-broken")).toMatchObject({
      hangulComposeMode: "android-firefox-slate-placeholder-broken",
      hangulKeyEventKey: "process",
    });
  });

  it("resolves android-firefox-slate-plain-control with golden replay compose mode", () => {
    expect(resolveProfile("android-firefox-slate-plain-control")).toMatchObject({
      hangulComposeMode: "android-firefox-slate-plain-control",
      hangulKeyEventKey: "process",
    });
  });

  it("resolves linux-chrome-slate-placeholder-fixed with golden replay compose mode", () => {
    expect(resolveProfile("linux-chrome-slate-placeholder-fixed")).toMatchObject({
      hangulComposeMode: "linux-chrome-slate-placeholder-fixed",
      hangulKeyEventKey: "process",
    });
  });

  it("resolves linux-chrome-slate-plain-control with golden replay compose mode", () => {
    expect(resolveProfile("linux-chrome-slate-plain-control")).toMatchObject({
      hangulComposeMode: "linux-chrome-slate-plain-control",
      hangulKeyEventKey: "process",
    });
  });

  it("resolves linux-firefox-slate-placeholder-fixed with golden replay compose mode", () => {
    expect(resolveProfile("linux-firefox-slate-placeholder-fixed")).toMatchObject({
      hangulComposeMode: "linux-firefox-slate-placeholder-fixed",
      hangulKeyEventKey: "process",
    });
  });

  it("resolves linux-firefox-slate-plain-control with golden replay compose mode", () => {
    expect(resolveProfile("linux-firefox-slate-plain-control")).toMatchObject({
      hangulComposeMode: "linux-firefox-slate-plain-control",
      hangulKeyEventKey: "process",
    });
  });

  it("throws for unknown profile ids", () => {
    expect(() => resolveProfile("not-a-real-profile")).toThrow(/Unknown IME profile/);
  });

  it("resolves android-firefox-contenteditable-broken with contenteditable-firefox-broken compose mode", () => {
    expect(resolveProfile("android-firefox-contenteditable-broken")).toMatchObject({
      id: "android-firefox-contenteditable-broken",
      hangulComposeMode: "contenteditable-firefox-broken",
      hangulKeyEventKey: "process",
    });
  });

  it("resolves linux-firefox-contenteditable-fixed with contenteditable-firefox-fixed compose mode", () => {
    expect(resolveProfile("linux-firefox-contenteditable-fixed")).toMatchObject({
      id: "linux-firefox-contenteditable-fixed",
      hangulComposeMode: "contenteditable-firefox-fixed",
      hangulKeyEventKey: "process",
    });
  });
});

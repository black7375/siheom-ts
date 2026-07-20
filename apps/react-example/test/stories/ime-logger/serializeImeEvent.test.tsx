import { describe, expect, it } from "vitest";

import { buildImeTrace, serializeImeEvent } from "./serializeImeEvent";

describe("serializeImeEvent", () => {
  it("turns a keyboard event into a stable JSON record", () => {
    const event = new KeyboardEvent("keydown", {
      key: "Process",
      code: "KeyR",
      keyCode: 229,
      bubbles: true,
    });
    Object.defineProperty(event, "isComposing", { value: true });

    expect(serializeImeEvent(event, "ㄱ")).toEqual({
      type: "keydown",
      key: "Process",
      code: "KeyR",
      keyCode: 229,
      isComposing: true,
      inputType: null,
      data: null,
      value: "ㄱ",
    });
  });

  it("turns an input event into a stable JSON record", () => {
    const event = new InputEvent("input", {
      inputType: "insertCompositionText",
      data: "기",
      bubbles: true,
    });
    Object.defineProperty(event, "isComposing", { value: true });

    expect(serializeImeEvent(event, "기")).toEqual({
      type: "input",
      key: null,
      code: null,
      keyCode: null,
      isComposing: true,
      inputType: "insertCompositionText",
      data: "기",
      value: "기",
    });
  });
});

describe("buildImeTrace", () => {
  it("wraps events with profile metadata and derived profileId", () => {
    const events = [
      serializeImeEvent(
        new KeyboardEvent("keydown", { key: "a", code: "KeyA" }),
        "a",
      ),
    ];

    const trace = buildImeTrace({
      os: "windows",
      browser: "chrome",
      ime: "nalgaeset",
      events,
      capturedAt: "2026-07-20T00:00:00.000Z",
      scenarioId: "continuous-hangul",
      source: "os-ime",
    });

    expect(trace).toEqual({
      profileId: "windows-chrome-nalgaeset",
      os: "windows",
      browser: "chrome",
      ime: "nalgaeset",
      capturedAt: "2026-07-20T00:00:00.000Z",
      scenarioId: "continuous-hangul",
      source: "os-ime",
      events,
    });
  });

  it("omits ime segment from profileId when ime is empty", () => {
    const trace = buildImeTrace({
      os: "macos",
      browser: "safari",
      ime: "",
      events: [],
      capturedAt: "2026-07-20T00:00:00.000Z",
      scenarioId: "mixed-en-ko",
      source: "user-event",
    });

    expect(trace.profileId).toBe("macos-safari");
    expect(trace.source).toBe("user-event");
  });
});

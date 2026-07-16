import { describe, expect, it } from "vitest";
import { defaultMessageMap, formatFailureReport, resolveMessageMap } from "./messages.ts";

describe("resolveMessageMap", () => {
  it("uses English defaults when no messages are provided", () => {
    expect(resolveMessageMap()).toEqual(defaultMessageMap);
  });

  it("merges partial overrides", () => {
    expect(resolveMessageMap({ logs: "로그" })).toEqual({
      ...defaultMessageMap,
      logs: "로그",
    });
  });
});

describe("formatFailureReport", () => {
  it("formats failure reports with default English section headers", () => {
    const report = formatFailureReport(["click! : button Go"], new Error("boom"), "button Go");

    expect(report).toBe(
      "[Logs]\n\nclick! : button Go\n\n[Original Error Message]\n\nboom\n\n[A11y Snapshot]\n\nbutton Go",
    );
  });

  it("formats failure reports with custom section headers", () => {
    const report = formatFailureReport(["click! : button Go"], new Error("boom"), "button Go", {
      logs: "로그",
      originalErrorMessage: "원본 에러 메시지",
      a11ySnapshot: "접근성 스냅샷",
    });

    expect(report).toBe(
      "[로그]\n\nclick! : button Go\n\n[원본 에러 메시지]\n\nboom\n\n[접근성 스냅샷]\n\nbutton Go",
    );
  });

  it("strips testing-library noise after Ignored node", () => {
    const report = formatFailureReport([], new Error("boom\n\nIgnored node: div"), "");

    expect(report).toContain("[Original Error Message]\n\nboom\n\n");
    expect(report).not.toContain("Ignored node");
  });
});

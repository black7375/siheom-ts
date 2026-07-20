import { describe, expect, it } from "vitest";

import {
  detectBrowser,
  detectIme,
  detectImeLoggerMeta,
  detectOs,
  type NavigatorLike,
} from "./detectImeLoggerMeta";

describe("detectOs", () => {
  it("reads platform from userAgentData when available", () => {
    const nav: NavigatorLike = {
      userAgent: "",
      platform: "",
      userAgentData: { platform: "macOS" },
    };
    expect(detectOs(nav)).toBe("macos");
  });

  it("falls back to userAgent parsing", () => {
    const nav: NavigatorLike = {
      userAgent:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
      platform: "Linux x86_64",
    };
    expect(detectOs(nav)).toBe("linux");
  });
});

describe("detectBrowser", () => {
  it("reads brands from userAgentData when available", () => {
    const nav: NavigatorLike = {
      userAgent: "",
      platform: "",
      userAgentData: {
        brands: [{ brand: "Google Chrome" }, { brand: "Chromium" }],
      },
    };
    expect(detectBrowser(nav)).toBe("chrome");
  });

  it("detects Safari from userAgent without Chrome token", () => {
    const nav: NavigatorLike = {
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
      platform: "MacIntel",
    };
    expect(detectBrowser(nav)).toBe("safari");
  });
});

describe("detectIme", () => {
  it("maps macOS and Windows to native IME slugs", () => {
    expect(detectIme("macos")).toBe("apple");
    expect(detectIme("windows")).toBe("ms");
    expect(detectIme("linux")).toBe("");
  });
});

describe("detectImeLoggerMeta", () => {
  it("combines OS, browser, and IME defaults", () => {
    const nav: NavigatorLike = {
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
      platform: "Win32",
    };

    expect(detectImeLoggerMeta(nav)).toEqual({
      os: "windows",
      browser: "chrome",
      ime: "ms",
    });
  });
});

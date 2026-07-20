import { afterEach, describe, expect, it } from "vitest";

import {
  IME_LOGGER_META_STORAGE_KEY,
  readImeLoggerMeta,
  resolveImeLoggerMeta,
  writeImeLoggerMeta,
} from "./imeLoggerMetaStorage";

afterEach(() => {
  localStorage.removeItem(IME_LOGGER_META_STORAGE_KEY);
});

describe("imeLoggerMetaStorage", () => {
  it("round-trips metadata through localStorage", () => {
    writeImeLoggerMeta({
      os: "linux",
      browser: "chrome",
      ime: "ibus-hangul",
    });

    expect(readImeLoggerMeta()).toEqual({
      os: "linux",
      browser: "chrome",
      ime: "ibus-hangul",
    });
  });

  it("prefers stored metadata over auto-detection", () => {
    writeImeLoggerMeta({
      os: "macos",
      browser: "safari",
      ime: "apple",
    });

    expect(resolveImeLoggerMeta()).toEqual({
      os: "macos",
      browser: "safari",
      ime: "apple",
    });
  });
});

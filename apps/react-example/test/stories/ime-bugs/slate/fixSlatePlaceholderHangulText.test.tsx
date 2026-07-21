import { describe, expect, it } from "vitest";

import { fixSlatePlaceholderHangulText } from "./fixSlatePlaceholderHangulText";

describe("fixSlatePlaceholderHangulText", () => {
  it("rewrites android-chrome jamo duplication ㄱㄱㅏ to 가 when composition data is ㄱㅏ", () => {
    expect(fixSlatePlaceholderHangulText("ㄱㄱㅏ", "ㄱㅏ")).toBe("가");
  });

  it("rewrites android-firefox stuck ㄱ to 가 when composition data is 가", () => {
    expect(fixSlatePlaceholderHangulText("ㄱ", "가")).toBe("가");
  });

  it("strips trailing jamo garbage after a correct syllable (가ㄱㅏ → 가)", () => {
    expect(fixSlatePlaceholderHangulText("가ㄱㅏ", "ㄱㅏ")).toBe("가");
  });

  it("returns null when visible text already matches composed syllable", () => {
    expect(fixSlatePlaceholderHangulText("가", "가")).toBeNull();
    expect(fixSlatePlaceholderHangulText("가", "ㄱㅏ")).toBeNull();
  });

  it("returns null for unrelated text", () => {
    expect(fixSlatePlaceholderHangulText("hello", "가")).toBeNull();
    expect(fixSlatePlaceholderHangulText("ㄱ", "ㄱ")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";

import {
  fixSlatePlaceholderHangulText,
  isStableCommittedText,
} from "./fixSlatePlaceholderHangulText";

describe("fixSlatePlaceholderHangulText (rejected rewrite heuristic)", () => {
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
    expect(fixSlatePlaceholderHangulText("가", "가ㄴ")).toBeNull();
  });

  it("dedupes android-firefox preedit prefix duplication (가가ㄴ + composition 가ㄴ → 가ㄴ)", () => {
    expect(fixSlatePlaceholderHangulText("가가ㄴ", "가ㄴ")).toBe("가ㄴ");
  });

  it("merges committed 가 with preedit 가ㄴ → 가ㄴ", () => {
    expect(fixSlatePlaceholderHangulText("가가ㄴ", "가ㄴ", "가")).toBe("가ㄴ");
  });

  it("dedupes android-firefox concatenated preedit append explosion", () => {
    expect(fixSlatePlaceholderHangulText("가가ㄴ가가ㄴㅏ", "가가ㄴㅏ", "가")).toBe("가나");
  });

  it("walks device AF fixed 가나다 explosion steps with committed state", () => {
    // Step 1: first syllable stuck → 가
    const step1 = fixSlatePlaceholderHangulText("ㄱ", "가");
    expect(step1).toBe("가");
    expect(isStableCommittedText(step1!)).toBe(true);
    const committedAfterGa = step1!;

    // Step 2: prefix dup while composing 나 (ㄴ)
    expect(fixSlatePlaceholderHangulText("가가ㄴ", "가ㄴ", committedAfterGa)).toBe("가ㄴ");

    // Step 3: append explosion while composing 나 (ㄴㅏ) → 가나
    const step3 = fixSlatePlaceholderHangulText("가가ㄴ가가ㄴㅏ", "가가ㄴㅏ", committedAfterGa);
    expect(step3).toBe("가나");
    expect(isStableCommittedText(step3!)).toBe(true);
    const committedAfterGana = step3!;

    // Step 4: explosion while composing 다 (ㄷ) → 가낟 (not yet 가나다)
    expect(
      fixSlatePlaceholderHangulText(
        "가가ㄴ가가ㄴㅏ가가ㄴ가가ㄴㅏㄷ",
        "가가ㄴ가가ㄴㅏㄷ",
        committedAfterGana,
      ),
    ).toBe("가낟");

    // Step 5: same composition, ㅏ → 가나다 (committed stays 가나 until compositionend)
    expect(
      fixSlatePlaceholderHangulText(
        "가가ㄴ가가ㄴㅏ가가ㄴ가가ㄴㅏㄷ가가ㄴ가가ㄴㅏ가가ㄴ가가ㄴㅏㄷㅏ",
        "가가ㄴ가가ㄴㅏ가가ㄴ가가ㄴㅏㄷㅏ",
        committedAfterGana,
      ),
    ).toBe("가나다");
  });

  it("returns null for unrelated text", () => {
    expect(fixSlatePlaceholderHangulText("hello", "가")).toBeNull();
    expect(fixSlatePlaceholderHangulText("ㄱ", "ㄱ")).toBeNull();
  });
});

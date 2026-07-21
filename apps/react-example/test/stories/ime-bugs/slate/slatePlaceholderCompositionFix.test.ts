import { describe, expect, it } from "vitest";

import {
  compositionPreeditCorrection,
  shouldSkipDuplicateCompositionInsert,
  shouldSkipFirefoxDeferredCompositionInput,
  syllableFromCompositionData,
} from "./slatePlaceholderCompositionFix";

describe("slatePlaceholderCompositionFix", () => {
  it("assembles jamo composition data to syllable", () => {
    expect(syllableFromCompositionData("ㄱㅏ")).toBe("가");
    expect(syllableFromCompositionData("가")).toBe("가");
  });

  it("corrects AC broken visible ㄱㄱㅏ when IME data is 가", () => {
    expect(compositionPreeditCorrection("ㄱㄱㅏ", "가")).toBe("가");
    expect(compositionPreeditCorrection("ㄱㄱ", "ㄱㅏ")).toBe("가");
  });
  it("skips duplicate insertCompositionText when DOM already shows the same preedit", () => {
    expect(shouldSkipDuplicateCompositionInsert("ㄱ", "ㄱ", "insertCompositionText")).toBe(true);
    expect(shouldSkipDuplicateCompositionInsert("가", "가", "insertCompositionText")).toBe(false);
  });

  it("skips Firefox deferred commit when slate already equals data", () => {
    expect(shouldSkipFirefoxDeferredCompositionInput("가", "가", false)).toBe(true);
  });

  it("skips Firefox explosion when data embeds the whole document", () => {
    const doc = "ㄱ가나다";
    expect(shouldSkipFirefoxDeferredCompositionInput(doc, `${doc}ㄱ`, false)).toBe(true);
  });
});

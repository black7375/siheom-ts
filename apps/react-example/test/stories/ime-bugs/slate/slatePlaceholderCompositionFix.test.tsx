import "./slateAndroidChromeEnv";

import { describe, expect, it } from "vitest";

import {
  dedupeDoubledSyllableCommit,
  shouldSkipDuplicateCompositionInsert,
  shouldSkipFirefoxDeferredCompositionInput,
  shouldSkipStaleDocumentCompositionInsert,
  syllableFromCompositionData,
  documentFromCommittedPreedit,
} from "./slatePlaceholderCompositionFix";

describe("slatePlaceholderCompositionFix", () => {
  it("assembles jamo composition data to syllable", () => {
    expect(syllableFromCompositionData("ㄱㅏ")).toBe("가");
    expect(syllableFromCompositionData("가")).toBe("가");
  });

  it("builds document from committed prefix + IME preedit", () => {
    expect(documentFromCommittedPreedit("", "ㄱ")).toBe("ㄱ");
    expect(documentFromCommittedPreedit("", "ㄱㅏ")).toBe("가");
    expect(documentFromCommittedPreedit("", "가")).toBe("가");
    expect(documentFromCommittedPreedit("가", "ㄴ")).toBe("가ㄴ");
    expect(documentFromCommittedPreedit("가", "나")).toBe("가나");
  });

  it("dedupes doubled syllable after compositionend flush", () => {
    expect(dedupeDoubledSyllableCommit("가가", "가")).toBe("가");
    expect(dedupeDoubledSyllableCommit("간간", "간")).toBe("간");
  });

  it("skips duplicate insertCompositionText when DOM already shows the same preedit", () => {
    expect(shouldSkipDuplicateCompositionInsert("ㄱ", "ㄱ", "insertCompositionText")).toBe(true);
    expect(shouldSkipDuplicateCompositionInsert("가", "가", "insertCompositionText")).toBe(true);
  });

  it("skips Firefox deferred duplicate syllable commit (가 → 가가)", () => {
    expect(shouldSkipFirefoxDeferredCompositionInput("가가", "가", false)).toBe(true);
    expect(shouldSkipFirefoxDeferredCompositionInput("간간", "간", false)).toBe(true);
  });

  it("skips Firefox deferred commit when slate already equals data", () => {
    expect(shouldSkipFirefoxDeferredCompositionInput("가", "가", false)).toBe(true);
  });

  it("skips Firefox explosion when data embeds the whole document", () => {
    const doc = "ㄱ가나다";
    expect(shouldSkipFirefoxDeferredCompositionInput(doc, `${doc}ㄱ`, false)).toBe(true);
  });

  it("skips composing insert that would concat stale document + preedit", () => {
    expect(
      shouldSkipStaleDocumentCompositionInsert(
        "가나간간",
        "가나",
        "insertCompositionText",
        true,
      ),
    ).toBe(true);
  });
});

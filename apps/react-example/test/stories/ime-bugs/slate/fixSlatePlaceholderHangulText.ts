import { assemble } from "es-hangul";

const JAMO_ONLY = /^[\u3131-\u314E\u314F-\u3163]+$/;
const HANGUL_SYLLABLE = /^[\uAC00-\uD7A3]$/;
const INVISIBLE = /[\uFEFF\u200B\u00A0]/g;

function stripInvisible(text: string): string {
  return text.replace(INVISIBLE, "");
}

export { stripInvisible };

function expectedFromCompositionData(compositionData: string): string | null {
  if (!compositionData) {
    return null;
  }
  if (HANGUL_SYLLABLE.test(compositionData)) {
    return compositionData;
  }
  if (!JAMO_ONLY.test(compositionData)) {
    return null;
  }
  return assemble([...compositionData]);
}

function collapseConsecutiveDuplicateJamo(text: string): string {
  return text.replace(/(.)\1+/g, "$1");
}

function jamoSequenceAssemblesTo(text: string, expected: string): boolean {
  if (!JAMO_ONLY.test(text)) {
    return false;
  }
  return assemble([...collapseConsecutiveDuplicateJamo(text)]) === expected;
}

/**
 * Slate #5989 — placeholder + first Hangul syllable breaks on Android.
 * When IME composition data forms a syllable but DOM shows jamo duplication
 * (Chrome) or a stuck initial jamo (Firefox), return the corrected syllable.
 */
export function fixSlatePlaceholderHangulText(
  visible: string,
  compositionData: string,
): string | null {
  const normalizedVisible = stripInvisible(visible);
  if (!normalizedVisible || !compositionData) {
    return null;
  }

  const expected = expectedFromCompositionData(compositionData);
  if (expected === null) {
    return null;
  }
  if (normalizedVisible === expected) {
    return null;
  }

  if (JAMO_ONLY.test(normalizedVisible) && HANGUL_SYLLABLE.test(expected)) {
    return expected;
  }

  if (JAMO_ONLY.test(normalizedVisible) && jamoSequenceAssemblesTo(normalizedVisible, expected)) {
    return expected;
  }

  if (
    normalizedVisible.startsWith(expected) &&
    normalizedVisible.length > expected.length &&
    jamoSequenceAssemblesTo(normalizedVisible.slice(expected.length), expected)
  ) {
    return expected;
  }

  return null;
}

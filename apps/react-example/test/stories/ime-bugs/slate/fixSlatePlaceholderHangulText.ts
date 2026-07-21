import { assemble } from "es-hangul";

const JAMO_ONLY = /^[\u3131-\u314E\u314F-\u3163]+$/;
const JAMO_CHAR = /[\u3131-\u314E\u314F-\u3163]/;
const HANGUL_SYLLABLE = /^[\uAC00-\uD7A3]$/;
const HANGUL_SYLLABLE_GLOBAL = /[\uAC00-\uD7A3]/g;
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

function dedupeLeadingSyllableInPreedit(text: string): string {
  const match = text.match(/^([\uAC00-\uD7A3])\1([\s\S]*)$/);
  if (match) {
    return match[1]! + match[2]!;
  }
  return text;
}

function normalizeAndroidFirefoxPreedit(compositionData: string): string {
  let text = compositionData;
  while (true) {
    const next = dedupeLeadingSyllableInPreedit(text);
    if (next === text) {
      break;
    }
    text = next;
  }

  const match = text.match(/^([\uAC00-\uD7A3]+)([\u3131-\u314E\u314F-\u3163]*)$/);
  if (!match) {
    return text;
  }
  const [, syllables, jamo] = match;
  if (!jamo) {
    return syllables!;
  }
  return syllables! + assemble([...jamo]);
}

function assemblePreeditTail(tail: string): string {
  if (!tail) {
    return "";
  }
  if (JAMO_ONLY.test(tail)) {
    return assemble([...tail]);
  }
  return tail;
}

function mergeCommittedPreedit(committed: string, compositionData: string): string | null {
  const first = committed[0];
  if (first && compositionData.startsWith(first + first)) {
    return committed + assemblePreeditTail(compositionData.slice(2));
  }

  if (compositionData.startsWith(committed)) {
    return committed + assemblePreeditTail(compositionData.slice(committed.length));
  }

  return null;
}

function fixAfPreeditDuplication(
  visible: string,
  compositionData: string,
  committed: string,
): string | null {
  if (!compositionData || visible === compositionData) {
    return null;
  }
  if (!HANGUL_SYLLABLE_GLOBAL.test(compositionData)) {
    return null;
  }

  if (committed) {
    const merged = mergeCommittedPreedit(committed, compositionData);
    if (merged !== null && merged !== visible) {
      return merged;
    }
  }

  const target = normalizeAndroidFirefoxPreedit(compositionData);
  if (visible === target) {
    return null;
  }

  const firstSyl = visible.match(/^[\uAC00-\uD7A3]/)?.[0];
  if (firstSyl && visible === firstSyl + compositionData && compositionData.startsWith(firstSyl)) {
    return compositionData;
  }

  for (let split = 1; split < visible.length; split++) {
    const prefix = visible.slice(0, split);
    if (visible === prefix + compositionData) {
      return target;
    }
  }

  return null;
}

export function shouldApplyFirstSyllableFix(visible: string): boolean {
  if (JAMO_ONLY.test(visible)) {
    return true;
  }

  const syllables = visible.match(HANGUL_SYLLABLE_GLOBAL) ?? [];
  if (syllables.length === 0) {
    return true;
  }
  if (syllables.length === 1) {
    const [syllable] = syllables;
    return visible.length > syllable!.length;
  }
  return false;
}

function fixFirstSyllablePlaceholderBug(visible: string, compositionData: string): string | null {
  if (!shouldApplyFirstSyllableFix(visible)) {
    return null;
  }

  const expected = expectedFromCompositionData(compositionData);
  if (expected === null) {
    return null;
  }
  if (visible === expected) {
    return null;
  }

  if (JAMO_ONLY.test(visible) && HANGUL_SYLLABLE.test(expected)) {
    return expected;
  }

  if (JAMO_ONLY.test(visible) && jamoSequenceAssemblesTo(visible, expected)) {
    return expected;
  }

  if (
    visible.startsWith(expected) &&
    visible.length > expected.length &&
    jamoSequenceAssemblesTo(visible.slice(expected.length), expected)
  ) {
    return expected;
  }

  return null;
}

/**
 * Slate #5989 — placeholder + Hangul composition breaks on Android.
 * - First syllable: jamo duplication / stuck jamo (Chrome + Firefox)
 * - Later syllables (Firefox): duplicated preedit prefix / append explosion
 */
export function fixSlatePlaceholderHangulText(
  visible: string,
  compositionData: string,
  committed = "",
): string | null {
  const normalizedVisible = stripInvisible(visible);
  if (!normalizedVisible || !compositionData) {
    return null;
  }

  return (
    fixAfPreeditDuplication(normalizedVisible, compositionData, committed) ??
    fixFirstSyllablePlaceholderBug(normalizedVisible, compositionData)
  );
}

export function isStableCommittedText(text: string): boolean {
  const normalized = stripInvisible(text);
  return /^[\uAC00-\uD7A3]+$/.test(normalized);
}

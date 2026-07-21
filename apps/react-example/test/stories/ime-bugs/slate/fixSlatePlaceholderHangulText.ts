import { assemble, disassemble } from "es-hangul";

const JAMO_ONLY = /^[\u3131-\u314E\u314F-\u3163]+$/;
const HANGUL_SYLLABLE = /^[\uAC00-\uD7A3]$/;
/** Non-global — safe for repeated `.test()` (global regex mutates lastIndex). */
const HAS_HANGUL_SYLLABLE = /[\uAC00-\uD7A3]/;
const HANGUL_SYLLABLE_GLOBAL = /[\uAC00-\uD7A3]/g;
const TRAILING_JAMO = /[\u3131-\u314E\u314F-\u3163]+$/;
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

function assemblePreeditTail(tail: string): string {
  if (!tail) {
    return "";
  }
  if (JAMO_ONLY.test(tail)) {
    return assemble([...tail]);
  }
  return tail;
}

/**
 * AF explosion leaves previous syllable jamos in the trailing jamo run
 * (e.g. committed 가나 → trailing ㄴㅏㄷ). Strip the overlap with
 * disassembled committed; return the novel jamo suffix.
 */
function novelJamosAfterCommitted(committed: string, compositionData: string): string[] | null {
  const trailing = compositionData.match(TRAILING_JAMO)?.[0];
  if (!trailing) {
    return null;
  }

  const trailChars = [...trailing];
  const committedChars = [...disassemble(committed)];
  let start = 0;
  for (
    let overlap = Math.min(trailChars.length, committedChars.length);
    overlap >= 1;
    overlap -= 1
  ) {
    if (trailChars.slice(0, overlap).join("") === committedChars.slice(-overlap).join("")) {
      start = overlap;
      break;
    }
  }

  const novel = trailChars.slice(start);
  if (novel.length === 0) {
    return null;
  }
  return novel;
}

/**
 * AF Slate: after syllables are committed, later composition data often duplicates
 * the committed prefix and/or appends the previous visible string (explosion).
 */
function mergeCommittedPreedit(committed: string, compositionData: string): string | null {
  if (!committed || !compositionData) {
    return null;
  }

  // Clean preedit: composition data is committed + jamo tail (가 + ㄴ → 가ㄴ).
  if (compositionData.startsWith(committed)) {
    const rest = compositionData.slice(committed.length);
    if (!rest || JAMO_ONLY.test(rest)) {
      return committed + assemblePreeditTail(rest);
    }
  }

  // Explosion: rebuild by reassembling committed jamos + novel trailing jamos
  // (가나 + ㄷ → 가낟, 가나 + ㄷㅏ → 가나다).
  const novel = novelJamosAfterCommitted(committed, compositionData);
  if (novel !== null) {
    return assemble([...disassemble(committed), ...novel]);
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
  if (!HAS_HANGUL_SYLLABLE.test(compositionData)) {
    return null;
  }

  if (committed) {
    const merged = mergeCommittedPreedit(committed, compositionData);
    if (merged !== null && merged !== visible) {
      return merged;
    }
  }

  // No committed yet: visible is `prefix + compositionData` (prefix = stuck first syllable)
  const firstSyl = visible.match(/^[\uAC00-\uD7A3]/)?.[0];
  if (firstSyl && visible === firstSyl + compositionData && compositionData.startsWith(firstSyl)) {
    return compositionData;
  }

  for (let split = 1; split < visible.length; split++) {
    const prefix = visible.slice(0, split);
    if (visible === prefix + compositionData) {
      return compositionData;
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
 * Historical heuristic for post-hoc Slate text rewrite.
 * **Rejected** for product fix — fights IME (flicker). See DEBUG.md.
 * Kept so we do not rediscover the same dead end without tests.
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

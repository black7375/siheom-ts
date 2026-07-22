import { assemble, canBeChoseong, canBeJongseong, canBeJungseong, combineVowels, disassembleCompleteCharacter } from "es-hangul";

import { hangulJamos } from "../hangulJamos";
import { keyForJamo } from "../_internal/jamoKeyMap";
import { keyForSebeolJamo } from "../_internal/jamoKeyMapSebeol";
import type { HangulCompositionBoundary, HangulKeyboardLayout } from "../profiles";

export type HangulKeyStroke = {
  jamo: string;
  code: string;
  key: string;
  /** isComposing on keydown (false only for the first key of a composition session) */
  keydownIsComposing: boolean;
  /** Fire compositionstart before applying preedit updates for this key */
  compositionStart: boolean;
  /**
   * Ordered preedit snapshots applied during this key (usually one).
   * Syllable-boundary keys may include: [oldSyllable, newSyllablePreedit]
   * with a compositionend between them.
   */
  preeditSteps: string[];
  /** Full input values after each preeditSteps entry (same length) */
  valuesAfterSteps: string[];
  /** If set, fire compositionend with this data after the first preedit step (before later steps) */
  commitAfterFirstStep?: string;
};

type SyllableParts = {
  choseong?: string;
  jungseong?: string;
  jongseong?: string;
};

function syllableText(parts: SyllableParts): string {
  const { choseong, jungseong, jongseong } = parts;
  if (!choseong) return "";
  if (!jungseong) return choseong;
  return assemble([choseong, jungseong, ...(jongseong ? [jongseong] : [])]);
}

function pushBoundaryStroke(
  strokes: HangulKeyStroke[],
  meta: { code: string; key: string },
  jamo: string,
  preeditSteps: [string, string],
  valuesAfterSteps: [string, string],
  commitAfterFirstStep: string,
) {
  strokes.push({
    jamo,
    code: meta.code,
    key: meta.key,
    keydownIsComposing: true,
    compositionStart: false,
    preeditSteps,
    valuesAfterSteps,
    commitAfterFirstStep,
  });
}

function pushSingleStepStroke(
  strokes: HangulKeyStroke[],
  meta: { code: string; key: string },
  jamo: string,
  preedit: string,
  value: string,
  composing: boolean,
) {
  strokes.push({
    jamo,
    code: meta.code,
    key: meta.key,
    keydownIsComposing: composing,
    compositionStart: !composing,
    preeditSteps: [preedit],
    valuesAfterSteps: [value],
  });
}

function tryGrowSyllable(current: SyllableParts, jamo: string): SyllableParts | null {
  if (canBeChoseong(jamo) && !current.choseong) {
    return { choseong: jamo };
  }
  if (canBeJungseong(jamo) && current.choseong && !current.jungseong) {
    return { ...current, jungseong: jamo };
  }
  // Compound jungseong (ㅡ+ㅣ → ㅢ, etc.) — only when there is no jongseong yet
  if (canBeJungseong(jamo) && current.choseong && current.jungseong && !current.jongseong) {
    try {
      const combined = combineVowels(current.jungseong, jamo);
      if (combined && canBeJungseong(combined)) {
        return { ...current, jungseong: combined };
      }
    } catch {
      // not a combinable vowel pair
    }
  }
  if (canBeJongseong(jamo) && current.choseong && current.jungseong && !current.jongseong) {
    return { ...current, jongseong: jamo };
  }
  if (
    canBeJongseong(jamo) &&
    current.choseong &&
    current.jungseong &&
    current.jongseong &&
    canBeJongseong(`${current.jongseong}${jamo}`)
  ) {
    return { ...current, jongseong: `${current.jongseong}${jamo}` };
  }
  return null;
}

export type PlanHangulKeystrokesOptions = {
  /** Already-committed text before this Hangul run (e.g. Latin prefix). */
  prefix?: string;
  /** Desktop IMEs commit per syllable; Android keeps one composition for the run. */
  compositionBoundary?: HangulCompositionBoundary;
  /** Physical keyboard layout (defaults to 2-set). */
  hangulKeyboard?: HangulKeyboardLayout;
};

function normalizeJungseong(raw: string): string {
  if (raw.length <= 1) return raw;
  const chars = [...raw];
  let combined = chars[0] ?? "";
  for (let i = 1; i < chars.length; i++) {
    const next = chars[i];
    if (!next) continue;
    try {
      combined = combineVowels(combined, next) ?? combined + next;
    } catch {
      combined += next;
    }
  }
  return combined;
}

/**
 * 날개셋 세벌식: plan per Unicode syllable with role-based keys.
 * No 2-set batchim look-ahead across syllables (태|희 not 탷→흐).
 * Compound jungseong like ㅢ is one key (Digit8), matching OS mid-preedit.
 */
function planSebeolsikNgs(text: string, prefix: string): HangulKeyStroke[] {
  const strokes: HangulKeyStroke[] = [];
  let committed = prefix;
  let current: SyllableParts = {};
  let composing = false;

  for (const char of text) {
    if (!char.trim()) continue;
    const parts = disassembleCompleteCharacter(char);
    if (!parts?.choseong) {
      throw new Error(`Cannot plan 세벌식-ngs for character: ${char}`);
    }

    const choseong = parts.choseong;
    const jungseong = parts.jungseong ? normalizeJungseong(parts.jungseong) : undefined;
    const jongseong = parts.jongseong ? parts.jongseong : undefined;
    const choMeta = keyForSebeolJamo(choseong, "choseong");

    if (current.choseong && current.jungseong) {
      const oldText = syllableText(current);
      const afterCommit = committed + oldText;
      pushBoundaryStroke(
        strokes,
        choMeta,
        choseong,
        [oldText, choseong],
        [afterCommit, afterCommit + choseong],
        oldText,
      );
      committed = afterCommit;
      current = { choseong };
      composing = true;
    } else {
      current = { choseong };
      pushSingleStepStroke(strokes, choMeta, choseong, choseong, committed + choseong, composing);
      composing = true;
    }

    if (jungseong) {
      const jungMeta = keyForSebeolJamo(jungseong, "jungseong");
      current = { ...current, jungseong };
      const preedit = syllableText(current);
      pushSingleStepStroke(strokes, jungMeta, jungseong, preedit, committed + preedit, true);
    }

    if (jongseong) {
      const jongMeta = keyForSebeolJamo(jongseong, "jongseong");
      current = { ...current, jongseong };
      const preedit = syllableText(current);
      pushSingleStepStroke(strokes, jongMeta, jongseong, preedit, committed + preedit, true);
    }
  }

  return strokes;
}

/** Plan per-keystroke Hangul IME behavior for `text` (2-set style / ibus-hangul-like). */
export function planHangulKeystrokes(
  text: string,
  options: PlanHangulKeystrokesOptions = {},
): HangulKeyStroke[] {
  if (options.hangulKeyboard === "sebeolsik-ngs") {
    return planSebeolsikNgs(text, options.prefix ?? "");
  }

  const jamos = hangulJamos(text);
  const strokes: HangulKeyStroke[] = [];
  const boundary = options.compositionBoundary ?? "syllable";
  let committed = options.prefix ?? "";
  /** Syllables already in the active run composition (android); empty for syllable mode. */
  let runBase = "";
  let current: SyllableParts = {};
  let composing = false;

  for (const jamo of jamos) {
    const meta = keyForJamo(jamo);

    // Vowel after jongseong: commit previous syllable, start next with (moved jong)+vowel.
    // Double batchim (ㄹㅅ→ㄽ): keep first jong, move last jong as next choseong (철+수).
    if (canBeJungseong(jamo) && current.choseong && current.jungseong && current.jongseong) {
      const jongChars = [...current.jongseong];
      const moved =
        jongChars.length > 1 ? (jongChars[jongChars.length - 1] ?? "") : current.jongseong;
      const keptJong = jongChars.length > 1 ? jongChars[0] : undefined;
      const stripped: SyllableParts = {
        choseong: current.choseong,
        jungseong: current.jungseong,
        ...(keptJong ? { jongseong: keptJong } : {}),
      };
      const strippedText = syllableText(stripped);
      current = { choseong: moved, jungseong: jamo };
      const nextPreedit = syllableText(current);

      if (boundary === "run") {
        runBase += strippedText;
        const preedit = runBase + nextPreedit;
        pushSingleStepStroke(strokes, meta, jamo, preedit, committed + preedit, composing);
        composing = true;
        continue;
      }

      const afterCommit = committed + strippedText;
      pushBoundaryStroke(
        strokes,
        meta,
        jamo,
        [strippedText, nextPreedit],
        [afterCommit, afterCommit + nextPreedit],
        strippedText,
      );

      committed = afterCommit;
      composing = true;
      continue;
    }

    const grown = tryGrowSyllable(current, jamo);
    if (grown) {
      current = grown;
      const preedit = runBase + syllableText(current);
      const value = committed + preedit;
      pushSingleStepStroke(strokes, meta, jamo, preedit, value, composing);
      composing = true;
      continue;
    }

    // New choseong after a syllable that already has a vowel (and possibly batchim)
    if (canBeChoseong(jamo) && current.choseong && current.jungseong) {
      const oldText = syllableText(current);

      if (boundary === "run") {
        runBase += oldText;
        current = { choseong: jamo };
        const preedit = runBase + jamo;
        pushSingleStepStroke(strokes, meta, jamo, preedit, committed + preedit, composing);
        composing = true;
        continue;
      }

      const afterCommit = committed + oldText;
      pushBoundaryStroke(
        strokes,
        meta,
        jamo,
        [oldText, jamo],
        [afterCommit, afterCommit + jamo],
        oldText,
      );

      committed = afterCommit;
      current = { choseong: jamo };
      composing = true;
      continue;
    }

    throw new Error(`Cannot place jamo "${jamo}" onto ${JSON.stringify(current)}`);
  }

  return strokes;
}

/** Append `suffix` to each planned value without mutating the input strokes. */
export function withSuffix(strokes: HangulKeyStroke[], suffix: string): HangulKeyStroke[] {
  if (!suffix)
    return strokes.map((stroke) => ({ ...stroke, valuesAfterSteps: [...stroke.valuesAfterSteps] }));
  return strokes.map((stroke) => ({
    ...stroke,
    valuesAfterSteps: stroke.valuesAfterSteps.map((value) => value + suffix),
  }));
}

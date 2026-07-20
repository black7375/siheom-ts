import { assemble, canBeChoseong, canBeJongseong, canBeJungseong, combineVowels } from "es-hangul";

import { hangulJamos } from "./hangulProgression";
import { keyForJamo } from "./jamoKeyMap";

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

/** Plan per-keystroke Hangul IME behavior for `text` (2-set style / ibus-hangul-like). */
export function planHangulKeystrokes(text: string): HangulKeyStroke[] {
  const jamos = hangulJamos(text);
  const strokes: HangulKeyStroke[] = [];
  let committed = "";
  let current: SyllableParts = {};
  let composing = false;

  for (const jamo of jamos) {
    const meta = keyForJamo(jamo);

    // Vowel after jongseong: commit syllable without jongseong, start next with jong+vowel
    if (canBeJungseong(jamo) && current.choseong && current.jungseong && current.jongseong) {
      const jong = current.jongseong;
      const stripped: SyllableParts = {
        choseong: current.choseong,
        jungseong: current.jungseong,
      };
      const strippedText = syllableText(stripped);
      const afterCommit = committed + strippedText;
      current = { choseong: jong, jungseong: jamo };
      const nextPreedit = syllableText(current);

      strokes.push({
        jamo,
        code: meta.code,
        key: meta.key,
        keydownIsComposing: true,
        compositionStart: false,
        preeditSteps: [strippedText, nextPreedit],
        valuesAfterSteps: [afterCommit, afterCommit + nextPreedit],
        commitAfterFirstStep: strippedText,
      });

      committed = afterCommit;
      composing = true;
      continue;
    }

    const grown = tryGrowSyllable(current, jamo);
    if (grown) {
      current = grown;
      const preedit = syllableText(current);
      const value = committed + preedit;
      const starting = !composing;

      strokes.push({
        jamo,
        code: meta.code,
        key: meta.key,
        keydownIsComposing: composing,
        compositionStart: starting,
        preeditSteps: [preedit],
        valuesAfterSteps: [value],
      });
      composing = true;
      continue;
    }

    // New choseong after a syllable that already has a vowel (and possibly batchim)
    if (canBeChoseong(jamo) && current.choseong && current.jungseong) {
      const oldText = syllableText(current);
      const afterCommit = committed + oldText;

      strokes.push({
        jamo,
        code: meta.code,
        key: meta.key,
        keydownIsComposing: true,
        compositionStart: false,
        preeditSteps: [oldText, jamo],
        valuesAfterSteps: [afterCommit, afterCommit + jamo],
        commitAfterFirstStep: oldText,
      });

      committed = afterCommit;
      current = { choseong: jamo };
      composing = true;
      continue;
    }

    throw new Error(`Cannot place jamo "${jamo}" onto ${JSON.stringify(current)}`);
  }

  return strokes;
}

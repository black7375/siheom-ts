/**
 * Shared helpers for Slate #5989 natural alternatives and retired experiments.
 * @see docs/research/slate-placeholder-fix-alternatives.md
 */
import { assemble } from "es-hangul";
import type { CSSProperties } from "react";
import type { Editor } from "slate";
import { Node } from "slate";
import { ReactEditor } from "slate-react";
import {
  EDITOR_TO_FORCE_RENDER,
  EDITOR_TO_PLACEHOLDER_ELEMENT,
  IS_ANDROID,
  IS_COMPOSING,
} from "slate-dom";

import { stripInvisible } from "./fixSlatePlaceholderHangulText";

type GuardedForceRender = (() => void) & {
  __slateImeGuard?: boolean;
  __slateImeOriginal?: () => void;
};

const JAMO = /^[\u3131-\u3163]+$/;
const SINGLE_JAMO = /^[\u3131-\u3163]$/;
const HANGUL_SYLLABLE = /^[\uAC00-\uD7A3]$/;
const HANGUL_SYLLABLES = /^[\uAC00-\uD7A3]+$/;

function isHangulSyllableString(text: string): boolean {
  return text.length > 0 && [...text].every((char) => HANGUL_SYLLABLE.test(char));
}

function longestCommonPrefixLength(a: string, b: string): number {
  let index = 0;
  while (index < a.length && index < b.length && a[index] === b[index]) {
    index += 1;
  }
  return index;
}

/** Slate Android IM flushes shortly after compositionend — keep guarding force-render. */
const COMPOSITION_COOLDOWN_MS = 600;
const lastCompositionEndAt = new WeakMap<Editor, number>();

/** IME preedit `data` → intended visible syllable (when jamo or syllable). */
export function syllableFromCompositionData(data: string): string | null {
  if (!data) {
    return null;
  }
  if (HANGUL_SYLLABLE.test(data)) {
    return data;
  }
  if (JAMO.test(data)) {
    return assemble([...data]);
  }
  return null;
}

export function noteCompositionEndForGuard(editor: Editor): void {
  lastCompositionEndAt.set(editor, Date.now());
}

function isInCompositionCooldown(editor: Editor): boolean {
  const at = lastCompositionEndAt.get(editor);
  return at !== undefined && Date.now() - at < COMPOSITION_COOLDOWN_MS;
}

/** Document text during an active composition session (committed prefix + live preedit). */
export function documentFromCommittedPreedit(committed: string, compositionData: string): string {
  if (!compositionData) {
    return committed;
  }

  // AF device: IME `data` is often cumulative preedit that already includes `committed`.
  if (committed && compositionData.startsWith(committed)) {
    return compositionData;
  }

  if (JAMO.test(compositionData)) {
    if (compositionData.length === 1) {
      return committed + compositionData;
    }
    return committed + assemble([...compositionData]);
  }

  const syllable = syllableFromCompositionData(compositionData);
  if (syllable) {
    return committed + syllable;
  }

  if (isHangulSyllableString(compositionData)) {
    if (longestCommonPrefixLength(committed, compositionData) >= 1) {
      return compositionData;
    }

    // Explosion-scale `data` echoes the broken document — keep committed.
    if (
      committed &&
      compositionData.includes(committed) &&
      compositionData.length > committed.length + 6
    ) {
      return committed;
    }

    return compositionData;
  }

  return committed + compositionData;
}

/**
 * AF broken device: DOM keeps one stuck choseong while IME `compositionend.data` is clean syllables.
 * `ㄱ가나다` + `가나다` → `가나다`; continuous `ㄱ가나다가나다` + `가나다가나다` → `가나다가나다`.
 */
export function stripOrphanLeadingJamoOnCompositionEnd(
  visible: string,
  endData: string,
): string | null {
  const normalized = stripInvisible(visible);
  if (!endData || !normalized || !HANGUL_SYLLABLES.test(endData)) {
    return null;
  }

  if (normalized.length === 1 && SINGLE_JAMO.test(normalized)) {
    return endData;
  }

  if (
    normalized.length === endData.length + 1 &&
    SINGLE_JAMO.test(normalized[0] ?? "") &&
    normalized.slice(1) === endData
  ) {
    return endData;
  }

  return null;
}

/** Normalize Slate text after compositionend flush (AF duplicates / cumulative endData). */
export function documentAfterCompositionEnd(
  committedBefore: string,
  endData: string,
  visible: string,
): string {
  const normalized = stripInvisible(visible);
  if (!endData) {
    return normalized;
  }

  if (committedBefore && endData.startsWith(committedBefore)) {
    return endData;
  }

  const deduped = dedupeDoubledSyllableCommit(normalized, endData);
  if (deduped) {
    return deduped;
  }

  if (isHangulSyllableString(endData) && endData.length > 1) {
    if (longestCommonPrefixLength(committedBefore, endData) >= 1) {
      return endData;
    }
  }

  const syllable = syllableFromCompositionData(endData);
  if (syllable) {
    if (committedBefore) {
      const intended = committedBefore + syllable;
      if (normalized === intended + syllable) {
        return intended;
      }
    }

    if (!committedBefore && normalized === syllable + syllable) {
      return syllable;
    }
  }

  return normalized;
}

/**
 * Trust IME `data` when visible text is broken (jamo split) — used by unit tests / legacy.
 * Runtime Android path uses {@link documentFromCommittedPreedit} instead.
 */
export function compositionPreeditCorrection(
  visible: string,
  compositionData: string | null | undefined,
): string | null {
  if (!IS_ANDROID || !compositionData) {
    return null;
  }

  const target = syllableFromCompositionData(compositionData);
  if (!target) {
    return null;
  }

  const normalized = stripInvisible(visible);
  if (normalized === target) {
    return null;
  }

  // Explosion-scale `data` echoes the document — never apply.
  if (compositionData.length > target.length + 4 && compositionData.includes(normalized)) {
    return null;
  }

  // AC #5989: jamo-only broken visible while IME preedit is the syllable.
  if (JAMO.test(normalized)) {
    return target;
  }

  // AF device: editor still holds previous syllables while `data` is fresh preedit.
  if (normalized.length > compositionData.length && normalized.includes(compositionData)) {
    return target;
  }

  return null;
}

/** After compositionend flush duplicates syllable (`가` → `가가`). */
export function dedupeDoubledSyllableCommit(
  visible: string,
  compositionEndData: string | null | undefined,
): string | null {
  if (!IS_ANDROID || !compositionEndData) {
    return null;
  }

  const syllable = syllableFromCompositionData(compositionEndData) ?? compositionEndData;
  if (!syllable) {
    return null;
  }

  if (visible === syllable + syllable) {
    return syllable;
  }

  return null;
}

/** Hide Slate's official placeholder element (keeps decoration; avoids IME targeting it). */
export function hideOfficialPlaceholderElement(editor: Editor): void {
  const placeholder = EDITOR_TO_PLACEHOLDER_ELEMENT.get(editor);
  if (placeholder) {
    placeholder.style.display = "none";
  }
}

export function isActivelyComposing(editor: Editor): boolean {
  return Boolean(IS_COMPOSING.get(editor) || ReactEditor.isComposing(editor));
}

export function placeholderStyleWhileComposing(
  editor: Editor,
  baseStyle: CSSProperties | undefined,
): CSSProperties {
  if (!isActivelyComposing(editor)) {
    return baseStyle ?? {};
  }
  return {
    ...(baseStyle ?? {}),
    display: "none",
  };
}

/**
 * Firefox deferred `insertCompositionText` after compositionend can re-insert the
 * syllable or the whole document (AF explosion captures).
 */
export function shouldSkipFirefoxDeferredCompositionInput(
  slateText: string,
  data: string | null | undefined,
  isComposing: boolean,
): boolean {
  if (isComposing || !data) {
    return false;
  }

  const visible = stripInvisible(slateText);
  if (!visible) {
    return false;
  }

  if (visible === data) {
    return true;
  }

  // Device: `가` → `가가`, `간` → `간간` on deferred commit after compositionend.
  if (
    visible.startsWith(data) &&
    visible.length > data.length &&
    visible.length <= data.length * 2 + 2
  ) {
    return true;
  }

  if (data.length > visible.length && data.includes(visible)) {
    return true;
  }

  return false;
}

/** Skip when DOM already shows the same jamo/syllable preedit (AC #5989 duplication). */
export function shouldSkipDuplicateCompositionInsert(
  domText: string,
  data: string | null | undefined,
  inputType: string,
): boolean {
  if (inputType !== "insertCompositionText" || !data) {
    return false;
  }

  const visible = stripInvisible(domText);
  if (!visible || visible !== data) {
    return false;
  }

  return true;
}

/**
 * While composing, skip Slate accepting an insert that would concatenate stale
 * document text with fresh preedit (`가나` + old `간간` → `가나간간`).
 */
export function shouldSkipStaleDocumentCompositionInsert(
  visible: string,
  data: string | null | undefined,
  inputType: string,
  isComposing: boolean,
): boolean {
  if (!isComposing || inputType !== "insertCompositionText" || !data) {
    return false;
  }

  const normalized = stripInvisible(visible);
  if (normalized.length > data.length + 1 && normalized.includes(data) && data.length <= 8) {
    return true;
  }

  return false;
}

function installForceRenderGuard(editor: Editor): void {
  const current = EDITOR_TO_FORCE_RENDER.get(editor) as GuardedForceRender | undefined;
  if (!current || current.__slateImeGuard) {
    return;
  }

  const guarded: GuardedForceRender = () => {
    if (isActivelyComposing(editor) || isInCompositionCooldown(editor)) {
      return;
    }
    current();
  };
  guarded.__slateImeGuard = true;
  guarded.__slateImeOriginal = current;
  EDITOR_TO_FORCE_RENDER.set(editor, guarded);
}

/** Re-wrap after each Editable render resets EDITOR_TO_FORCE_RENDER. */
export function attachSlatePlaceholderCompositionFix(editor: Editor): () => void {
  installForceRenderGuard(editor);

  const previousOnChange = editor.onChange;
  editor.onChange = () => {
    previousOnChange();
    installForceRenderGuard(editor);
  };

  return () => {
    editor.onChange = previousOnChange;
    const guarded = EDITOR_TO_FORCE_RENDER.get(editor) as GuardedForceRender | undefined;
    if (guarded?.__slateImeOriginal) {
      EDITOR_TO_FORCE_RENDER.set(editor, guarded.__slateImeOriginal);
    }
  };
}

export function readSlateVisibleText(editor: Editor): string {
  return stripInvisible(Node.string(editor));
}

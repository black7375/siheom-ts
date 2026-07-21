import { assemble } from "es-hangul";
import type { CSSProperties } from "react";
import type { Editor } from "slate";
import { Node } from "slate";
import { ReactEditor } from "slate-react";
import { EDITOR_TO_FORCE_RENDER, EDITOR_TO_PLACEHOLDER_ELEMENT, IS_ANDROID, IS_COMPOSING } from "slate-dom";

import { stripInvisible } from "./fixSlatePlaceholderHangulText";

type GuardedForceRender = (() => void) & {
  __slateImeGuard?: boolean;
  __slateImeOriginal?: () => void;
};

const JAMO = /^[\u3131-\u3163]+$/;
const HANGUL_SYLLABLE = /^[\uAC00-\uD7A3]$/;

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

/**
 * When Slate placeholder + Android leaves broken visible text but IME `data` is the
 * intended syllable, trust composition `data` (not post-hoc guessing).
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

  // Ignore explosion-scale `data` (whole document echoed back).
  if (compositionData.length > target.length + 4 && compositionData.includes(normalized)) {
    return null;
  }

  if (normalized.length <= target.length + 2) {
    return target;
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
 * whole document and cause exponential growth (AF explosion captures).
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

  if (data.length > visible.length + 2 && data.includes(visible)) {
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

function installForceRenderGuard(editor: Editor): void {
  const current = EDITOR_TO_FORCE_RENDER.get(editor) as GuardedForceRender | undefined;
  if (!current || current.__slateImeGuard) {
    return;
  }

  const guarded: GuardedForceRender = () => {
    if (isActivelyComposing(editor)) {
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

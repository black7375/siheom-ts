import { useEffect, useRef } from "react";
import type { Editor } from "slate";
import { useSlateStatic } from "slate-react";

import {
  fixSlatePlaceholderHangulText,
  isStableCommittedText,
  shouldApplyFirstSyllableFix,
  stripInvisible,
} from "./fixSlatePlaceholderHangulText";
import { noteSlateFixPlugin } from "./SlateCompositionDebugPlugin";
import type { SlateCompositionDebugLog } from "./slateCompositionDebugLog";
import { readSlatePlainText } from "./readSlatePlainText";
import { replaceSlateEditorPlainText } from "./replaceSlateEditorPlainText";

function useSlatePlaceholderHangulFixEffect(
  editor: Editor,
  editable: HTMLElement | null,
  enabled: boolean,
  debugLog?: SlateCompositionDebugLog,
): void {
  const compositionDataRef = useRef("");
  const committedRef = useRef("");

  useEffect(() => {
    if (!enabled || !editable) {
      return;
    }

    const fixState = () => ({
      compositionData: compositionDataRef.current,
      committed: committedRef.current,
    });

    const syncIfBroken = (compositionData: string, reason: string) => {
      window.setTimeout(() => {
        if (!compositionData) {
          return;
        }
        const visible = readSlatePlainText(editable);
        const committed = committedRef.current;
        const fixed = fixSlatePlaceholderHangulText(visible, compositionData, committed);
        if (fixed !== null && fixed !== stripInvisible(visible)) {
          noteSlateFixPlugin(
            debugLog,
            editor,
            editable,
            "rewrite",
            { reason, from: stripInvisible(visible), to: fixed, compositionData, committed },
            fixState(),
          );
          replaceSlateEditorPlainText(editor, fixed);
          // Only advance committed after composition settles — mid-preedit
          // "가낟" must not become the base for the next ㅏ (→ 가낟다).
          if (
            (reason === "compositionend" || reason === "input-deferred") &&
            isStableCommittedText(fixed)
          ) {
            committedRef.current = fixed;
          }
          return;
        }

        noteSlateFixPlugin(
          debugLog,
          editor,
          editable,
          "noop",
          { reason, visible: stripInvisible(visible), compositionData, committed, fixed },
          fixState(),
        );
      }, 0);
    };

    const onCompositionStart = () => {
      compositionDataRef.current = "";
      const visible = stripInvisible(readSlatePlainText(editable));
      committedRef.current = isStableCommittedText(visible) ? visible : "";
      noteSlateFixPlugin(
        debugLog,
        editor,
        editable,
        "compositionstart",
        { visible, committed: committedRef.current },
        fixState(),
      );
    };

    const onCompositionUpdate = (event: CompositionEvent) => {
      compositionDataRef.current = event.data;
      const visible = stripInvisible(readSlatePlainText(editable));
      const applyFirst = shouldApplyFirstSyllableFix(visible);
      noteSlateFixPlugin(
        debugLog,
        editor,
        editable,
        "compositionupdate",
        { data: event.data, visible, applyFirstSyllableFix: applyFirst },
        fixState(),
      );
      if (applyFirst) {
        syncIfBroken(event.data, "compositionupdate");
      }
    };

    const onCompositionEnd = (event: CompositionEvent) => {
      const data = event.data || compositionDataRef.current;
      noteSlateFixPlugin(
        debugLog,
        editor,
        editable,
        "compositionend",
        { data },
        fixState(),
      );
      syncIfBroken(data, "compositionend");
    };

    const onInput = (event: Event) => {
      if (!(event instanceof InputEvent) || event.isComposing) {
        return;
      }
      const data = event.data ?? compositionDataRef.current;
      noteSlateFixPlugin(
        debugLog,
        editor,
        editable,
        "input-deferred",
        { data, inputType: event.inputType },
        fixState(),
      );
      if (data) {
        syncIfBroken(data, "input-deferred");
      }
    };

    editable.addEventListener("compositionstart", onCompositionStart);
    editable.addEventListener("compositionupdate", onCompositionUpdate);
    editable.addEventListener("compositionend", onCompositionEnd);
    editable.addEventListener("input", onInput);

    return () => {
      editable.removeEventListener("compositionstart", onCompositionStart);
      editable.removeEventListener("compositionupdate", onCompositionUpdate);
      editable.removeEventListener("compositionend", onCompositionEnd);
      editable.removeEventListener("input", onInput);
    };
  }, [debugLog, editor, editable, enabled]);
}

/**
 * Slate #5989 workaround — after IME events settle, rewrite jamo-duplication /
 * stuck-jamo DOM text to the composed syllable from composition data.
 */
export function SlatePlaceholderHangulFixPlugin({
  enabled,
  editable,
  debugLog,
}: {
  enabled: boolean;
  editable: HTMLElement | null;
  debugLog?: SlateCompositionDebugLog;
}) {
  const editor = useSlateStatic();
  useSlatePlaceholderHangulFixEffect(editor, editable, enabled, debugLog);
  return null;
}

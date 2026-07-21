import { useEffect, useRef } from "react";
import type { Editor } from "slate";
import { useSlateStatic } from "slate-react";

import { fixSlatePlaceholderHangulText, stripInvisible } from "./fixSlatePlaceholderHangulText";
import { readSlatePlainText } from "./readSlatePlainText";
import { replaceSlateEditorPlainText } from "./replaceSlateEditorPlainText";

function useSlatePlaceholderHangulFixEffect(
  editor: Editor,
  editable: HTMLElement | null,
  enabled: boolean,
): void {
  const compositionDataRef = useRef("");

  useEffect(() => {
    if (!enabled || !editable) {
      return;
    }

    const syncIfBroken = (compositionData: string) => {
      const run = () => {
        if (!compositionData) {
          return;
        }
        const visible = readSlatePlainText(editable);
        const fixed = fixSlatePlaceholderHangulText(visible, compositionData);
        if (fixed !== null && fixed !== stripInvisible(visible)) {
          replaceSlateEditorPlainText(editor, fixed);
        }
      };

      window.setTimeout(() => {
        run();
        window.setTimeout(run, 0);
      }, 0);
    };

    const onCompositionUpdate = (event: CompositionEvent) => {
      compositionDataRef.current = event.data;
      syncIfBroken(event.data);
    };

    const onCompositionEnd = (event: CompositionEvent) => {
      syncIfBroken(event.data || compositionDataRef.current);
    };

    const onInput = (event: Event) => {
      if (!(event instanceof InputEvent)) {
        return;
      }
      const data = event.data ?? compositionDataRef.current;
      if (data) {
        syncIfBroken(data);
      }
    };

    editable.addEventListener("compositionupdate", onCompositionUpdate);
    editable.addEventListener("compositionend", onCompositionEnd);
    editable.addEventListener("input", onInput);

    return () => {
      editable.removeEventListener("compositionupdate", onCompositionUpdate);
      editable.removeEventListener("compositionend", onCompositionEnd);
      editable.removeEventListener("input", onInput);
    };
  }, [editor, editable, enabled]);
}

/**
 * Slate #5989 workaround — after IME events settle, rewrite jamo-duplication /
 * stuck-jamo DOM text to the composed syllable from composition data.
 */
export function SlatePlaceholderHangulFixPlugin({
  enabled,
  editable,
}: {
  enabled: boolean;
  editable: HTMLElement | null;
}) {
  const editor = useSlateStatic();
  useSlatePlaceholderHangulFixEffect(editor, editable, enabled);
  return null;
}

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Editor } from "slate";
import { Editor as SlateEditor, Transforms } from "slate";
import type { RenderPlaceholderProps } from "slate-react";
import { IS_ANDROID } from "slate-dom";

import {
  attachSlatePlaceholderCompositionFix,
  dedupeDoubledSyllableCommit,
  documentFromCommittedPreedit,
  hideOfficialPlaceholderElement,
  noteCompositionEndForGuard,
  placeholderStyleWhileComposing,
  readSlateVisibleText,
  shouldSkipDuplicateCompositionInsert,
  shouldSkipFirefoxDeferredCompositionInput,
} from "./slatePlaceholderCompositionFix";
import { readSlatePlainText } from "./readSlatePlainText";
import { replaceSlateEditorPlainText } from "./replaceSlateEditorPlainText";

const ANDROID_IM_FLUSH_MS = 400;
const JAMO = /^[\u3131-\u3163]+$/;

/**
 * Slate #5989 / AF explosion — keeps official `placeholder` prop.
 *
 * Android: drive the document from `committed + IME preedit` during composition
 * instead of Slate Android IM concat (device explosion captures).
 */
export function useSlatePlaceholderCompositionFixEditableProps(
  editor: Editor | undefined,
  editable: HTMLElement | null,
) {
  const committedHangulRef = useRef("");
  const compositionEndDataRef = useRef<string | null>(null);

  useEffect(() => {
    if (!editor) {
      return;
    }
    committedHangulRef.current = "";
    return attachSlatePlaceholderCompositionFix(editor);
  }, [editor]);

  const renderPlaceholder = useCallback(
    ({ attributes, children }: RenderPlaceholderProps) => {
      if (!editor) {
        return (
          <span {...attributes}>
            {children}
          </span>
        );
      }

      return (
        <span
          {...attributes}
          style={placeholderStyleWhileComposing(
            editor,
            attributes.style as React.CSSProperties | undefined,
          )}
        >
          {children}
        </span>
      );
    },
    [editor],
  );

  const onCompositionStart = useCallback(() => {
    if (!editor) {
      return;
    }
    hideOfficialPlaceholderElement(editor);
    const start = SlateEditor.start(editor, []);
    Transforms.select(editor, start);
  }, [editor]);

  const syncCommittedFromEditor = useCallback(() => {
    if (!editor) {
      return;
    }
    committedHangulRef.current = readSlateVisibleText(editor);
  }, [editor]);

  const onCompositionEnd = useCallback(
    (event: React.CompositionEvent) => {
      if (!editor) {
        return;
      }

      compositionEndDataRef.current = event.data;
      noteCompositionEndForGuard(editor);

      window.setTimeout(() => {
        const endData = compositionEndDataRef.current;
        let visible = readSlateVisibleText(editor);
        const deduped = dedupeDoubledSyllableCommit(visible, endData);
        if (deduped) {
          replaceSlateEditorPlainText(editor, deduped);
          visible = deduped;
        }
        committedHangulRef.current = visible;
      }, ANDROID_IM_FLUSH_MS);
    },
    [editor],
  );

  const onDOMBeforeInput = useCallback(
    (event: InputEvent) => {
      if (!editor) {
        return;
      }

      const domText = readSlatePlainText(editable);

      if (
        shouldSkipDuplicateCompositionInsert(domText, event.data, event.inputType) ||
        shouldSkipFirefoxDeferredCompositionInput(
          readSlateVisibleText(editor),
          event.data,
          event.isComposing,
        )
      ) {
        event.preventDefault();
        return;
      }

      if (
        IS_ANDROID &&
        event.isComposing &&
        event.inputType === "insertCompositionText" &&
        event.data
      ) {
        const next = documentFromCommittedPreedit(committedHangulRef.current, event.data);
        replaceSlateEditorPlainText(editor, next);
        event.preventDefault();
        return;
      }

      if (
        IS_ANDROID &&
        !event.isComposing &&
        event.inputType === "insertCompositionText" &&
        event.data
      ) {
        syncCommittedFromEditor();
        event.preventDefault();
      }
    },
    [editable, editor, syncCommittedFromEditor],
  );

  return useMemo(
    () =>
      editor
        ? {
            renderPlaceholder,
            onCompositionStart,
            onCompositionEnd,
            onDOMBeforeInput,
          }
        : {},
    [editor, onCompositionEnd, onCompositionStart, onDOMBeforeInput, renderPlaceholder],
  );
}

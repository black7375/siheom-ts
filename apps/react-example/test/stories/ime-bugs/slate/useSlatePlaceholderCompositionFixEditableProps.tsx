import { useCallback, useEffect, useMemo } from "react";
import type { Editor } from "slate";
import { Editor as SlateEditor, Transforms } from "slate";
import type { RenderPlaceholderProps } from "slate-react";

import {
  attachSlatePlaceholderCompositionFix,
  compositionPreeditCorrection,
  hideOfficialPlaceholderElement,
  placeholderStyleWhileComposing,
  readSlateVisibleText,
  shouldSkipDuplicateCompositionInsert,
  shouldSkipFirefoxDeferredCompositionInput,
} from "./slatePlaceholderCompositionFix";
import { readSlatePlainText } from "./readSlatePlainText";
import { replaceSlateEditorPlainText } from "./replaceSlateEditorPlainText";

/**
 * Slate #5989 / AF explosion mechanism patch — keeps official `placeholder` prop.
 *
 * - Hide placeholder visually while IS_COMPOSING (Android never flips React isComposing)
 * - Skip force-re-render from MutationObserver during composition
 * - Block duplicate composition inserts + Firefox deferred document re-insert
 */
export function useSlatePlaceholderCompositionFixEditableProps(
  editor: Editor | undefined,
  editable: HTMLElement | null,
) {
  useEffect(() => {
    if (!editor) {
      return;
    }
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

  const onDOMBeforeInput = useCallback(
    (event: InputEvent) => {
      if (!editor) {
        return;
      }

      const domText = readSlatePlainText(editable);
      const corrected = compositionPreeditCorrection(domText, event.data);
      if (corrected) {
        replaceSlateEditorPlainText(editor, corrected);
        event.preventDefault();
        return;
      }

      if (
        shouldSkipDuplicateCompositionInsert(domText, event.data, event.inputType) ||
        shouldSkipFirefoxDeferredCompositionInput(
          readSlateVisibleText(editor),
          event.data,
          event.isComposing,
        )
      ) {
        event.preventDefault();
      }
    },
    [editable, editor],
  );

  return useMemo(
    () =>
      editor
        ? {
            renderPlaceholder,
            onCompositionStart,
            onDOMBeforeInput,
          }
        : {},
    [editor, onCompositionStart, onDOMBeforeInput, renderPlaceholder],
  );
}

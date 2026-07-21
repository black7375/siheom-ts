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
import { readSlateCompositionSnapshotModelOnly } from "./readSlateCompositionSnapshot";
import { replaceSlateEditorPlainText } from "./replaceSlateEditorPlainText";
import type { SlateCompositionDebugLog } from "./slateCompositionDebugLog";
import { pushSlateFixDebugEntry } from "./slateCompositionDebugLog";
import {
  clearSlateFixDebugState,
  noteSlateFixAction,
  setSlateFixCommittedHangul,
} from "./slateFixDebugState";

const ANDROID_IM_FLUSH_MS = 400;

export type UseSlatePlaceholderCompositionFixOptions = {
  editor: Editor | undefined;
  editable: HTMLElement | null;
  debugLog?: SlateCompositionDebugLog;
  debugLabel?: string;
};

/**
 * Slate #5989 / AF explosion — keeps official `placeholder` prop.
 */
export function useSlatePlaceholderCompositionFixEditableProps({
  editor,
  editable,
  debugLog,
  debugLabel = "fixed",
}: UseSlatePlaceholderCompositionFixOptions) {
  const committedHangulRef = useRef("");
  const compositionEndDataRef = useRef<string | null>(null);

  const noteFix = useCallback(
    (action: string, detail: Record<string, unknown>, deferSnapshot = false) => {
      if (!editor) {
        return;
      }
      noteSlateFixAction(editor, action, detail);
      if (!debugLog) {
        return;
      }

      const write = () => {
        pushSlateFixDebugEntry(
          debugLog,
          debugLabel,
          action,
          detail,
          readSlateCompositionSnapshotModelOnly(editor),
        );
      };

      if (deferSnapshot) {
        queueMicrotask(write);
        return;
      }

      write();
    },
    [debugLabel, debugLog, editable, editor],
  );

  useEffect(() => {
    if (!editor) {
      return;
    }
    committedHangulRef.current = "";
    setSlateFixCommittedHangul(editor, "");
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
    noteFix("composition-start", { committed: committedHangulRef.current });
  }, [editor, noteFix]);

  const syncCommittedFromEditor = useCallback(() => {
    if (!editor) {
      return;
    }
    const visible = readSlateVisibleText(editor);
    committedHangulRef.current = visible;
    setSlateFixCommittedHangul(editor, visible);
  }, [editor]);

  const onCompositionEnd = useCallback(
    (event: React.CompositionEvent) => {
      if (!editor) {
        return;
      }

      compositionEndDataRef.current = event.data;
      noteCompositionEndForGuard(editor);
      noteFix("composition-end", { data: event.data, committedBefore: committedHangulRef.current });

      window.setTimeout(() => {
        const endData = compositionEndDataRef.current;
        let visible = readSlateVisibleText(editor);
        const beforeDedupe = visible;
        const deduped = dedupeDoubledSyllableCommit(visible, endData);
        if (deduped) {
          replaceSlateEditorPlainText(editor, deduped);
          visible = deduped;
          noteFix("dedupe-after-flush", { endData, before: beforeDedupe, after: deduped });
        }
        committedHangulRef.current = visible;
        setSlateFixCommittedHangul(editor, visible);
        noteFix("committed-sync", { committed: visible, endData });
      }, ANDROID_IM_FLUSH_MS);
    },
    [editor, noteFix],
  );

  const onDOMBeforeInput = useCallback(
    (event: InputEvent) => {
      if (!editor) {
        return;
      }

      const domText = readSlatePlainText(editable);
      const slateText = readSlateVisibleText(editor);

      if (
        shouldSkipDuplicateCompositionInsert(domText, event.data, event.inputType) ||
        shouldSkipFirefoxDeferredCompositionInput(slateText, event.data, event.isComposing)
      ) {
        noteFix("skip-input", {
          reason: "duplicate-or-deferred",
          inputType: event.inputType,
          data: event.data,
          isComposing: event.isComposing,
          domText,
          slateText,
          committed: committedHangulRef.current,
        }, true);
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
        noteFix("committed-preedit", {
          committed: committedHangulRef.current,
          data: event.data,
          next,
          domText,
          slateText,
        }, true);
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
        noteFix("skip-deferred-sync", {
          data: event.data,
          committed: committedHangulRef.current,
          domText,
          slateText,
        }, true);
        event.preventDefault();
      }
    },
    [editable, editor, noteFix, syncCommittedFromEditor],
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

export function clearSlatePlaceholderCompositionFixDebug(editor: Editor): void {
  clearSlateFixDebugState(editor);
}

import { useCallback, useEffect, useMemo } from "react";
import type { Editor } from "slate";
import { Editor as SlateEditor, Transforms } from "slate";
import type { RenderPlaceholderProps } from "slate-react";

import {
  attachSlatePlaceholderCompositionFix,
  hideOfficialPlaceholderElement,
  noteCompositionEndForGuard,
  placeholderStyleWhileComposing,
  readSlateVisibleText,
} from "./slatePlaceholderCompositionFix";
import type { SlatePlaceholderAlternative } from "./slatePlaceholderAlternatives";
import {
  isImeProcessKey,
  usesCompositionAnchor,
  usesForceRenderGuard,
  usesPlaceholderHideWhileComposing,
} from "./slatePlaceholderAlternatives";
import { readSlateCompositionSnapshotModelOnly } from "./readSlateCompositionSnapshot";
import type { SlateCompositionDebugLog } from "./slateCompositionDebugLog";
import { pushSlateFixDebugEntry } from "./slateCompositionDebugLog";
import { noteSlateFixAction } from "./slateFixDebugState";

export type UseSlatePlaceholderAlternativeOptions = {
  editor: Editor | undefined;
  mode: SlatePlaceholderAlternative;
  debugLog?: SlateCompositionDebugLog;
  debugLabel?: string;
};

/**
 * Alternatives A/B/C — no document rewrite, no onDOMBeforeInput preedit drive.
 * @see docs/research/slate-placeholder-fix-alternatives.md
 */
export function useSlatePlaceholderAlternativeEditableProps({
  editor,
  mode,
  debugLog,
  debugLabel,
}: UseSlatePlaceholderAlternativeOptions) {
  const label = debugLabel ?? mode;
  const anchor = usesCompositionAnchor(mode);
  const guard = usesForceRenderGuard(mode);
  const hideWhileComposing = usesPlaceholderHideWhileComposing(mode);

  const noteFix = useCallback(
    (action: string, detail: Record<string, unknown>) => {
      if (!editor) {
        return;
      }
      noteSlateFixAction(editor, action, detail);
      if (!debugLog) {
        return;
      }
      pushSlateFixDebugEntry(
        debugLog,
        label,
        action,
        detail,
        readSlateCompositionSnapshotModelOnly(editor),
      );
    },
    [debugLog, editor, label],
  );

  useEffect(() => {
    if (!editor || !guard) {
      return;
    }
    return attachSlatePlaceholderCompositionFix(editor);
  }, [editor, guard]);

  const renderPlaceholder = useCallback(
    ({ attributes, children }: RenderPlaceholderProps) => {
      if (!editor || !hideWhileComposing) {
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
    [editor, hideWhileComposing],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!editor || !anchor || !isImeProcessKey(event.nativeEvent)) {
        return;
      }
      hideOfficialPlaceholderElement(editor);
      noteFix("keydown-hide-placeholder", { key: event.key, keyCode: event.keyCode });
    },
    [anchor, editor, noteFix],
  );

  const onCompositionStart = useCallback(() => {
    if (!editor || !anchor) {
      return;
    }
    hideOfficialPlaceholderElement(editor);
    const visible = readSlateVisibleText(editor);
    if (!visible) {
      const start = SlateEditor.start(editor, []);
      Transforms.select(editor, start);
    }
    noteFix("composition-start-anchor", { visible, selectedStart: !visible });
  }, [anchor, editor, noteFix]);

  const onCompositionEnd = useCallback(() => {
    if (!editor || !guard) {
      return;
    }
    noteCompositionEndForGuard(editor);
    noteFix("composition-end-guard-cooldown", {});
  }, [editor, guard, noteFix]);

  return useMemo(() => {
    if (!editor) {
      return {};
    }

    const props: {
      renderPlaceholder?: typeof renderPlaceholder;
      onKeyDown?: typeof onKeyDown;
      onCompositionStart?: typeof onCompositionStart;
      onCompositionEnd?: typeof onCompositionEnd;
    } = {};

    if (hideWhileComposing) {
      props.renderPlaceholder = renderPlaceholder;
    }
    if (anchor) {
      props.onKeyDown = onKeyDown;
      props.onCompositionStart = onCompositionStart;
    }
    if (guard) {
      props.onCompositionEnd = onCompositionEnd;
    }

    return props;
  }, [
    anchor,
    editor,
    guard,
    hideWhileComposing,
    onCompositionEnd,
    onCompositionStart,
    onKeyDown,
    renderPlaceholder,
  ]);
}

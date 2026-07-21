import { useCallback, useMemo, useRef } from "react";
import type { Editor } from "slate";

import type { ImeEventRecord } from "../../ime-logger/serializeImeEvent";
import { createSlateExplorationLog, type SlateExplorationLog } from "./slateExplorationCapture";

export function useSlateExplorationCapture({
  editor,
  slateEditable,
  textareaRef,
  explorationLog: explorationLogProp,
  enabled = true,
}: {
  editor: Editor;
  slateEditable: HTMLElement | null;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  explorationLog?: SlateExplorationLog;
  enabled?: boolean;
}) {
  const internalLog = useMemo(() => createSlateExplorationLog(), []);
  const explorationLog = explorationLogProp ?? internalLog;
  const eventIndexRef = useRef(0);

  const resetIndex = useCallback(() => {
    if (!enabled) {
      return;
    }
    eventIndexRef.current = 0;
    explorationLog.clear();
  }, [enabled, explorationLog]);

  const onEventRecorded = useCallback(
    (_event: Event, record: ImeEventRecord) => {
      if (!enabled) {
        return;
      }

      const index = eventIndexRef.current;
      eventIndexRef.current += 1;

      queueMicrotask(() => {
        explorationLog.pushDeferredSnapshot({
          index,
          record,
          editor,
          slateEditable,
          textareaRef: textareaRef.current,
        });
      });
    },
    [enabled, editor, explorationLog, slateEditable, textareaRef],
  );

  return { explorationLog, onEventRecorded, resetIndex };
}

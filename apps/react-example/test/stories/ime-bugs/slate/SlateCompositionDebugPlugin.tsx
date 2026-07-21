import { useEffect } from "react";
import { useSlateStatic } from "slate-react";

import type { SlateCompositionDebugEntry, SlateCompositionDebugLog } from "./slateCompositionDebugLog";
import { readSlateCompositionSnapshot } from "./readSlateCompositionSnapshot";

const DOM_TYPES = [
  "keydown",
  "keyup",
  "compositionstart",
  "compositionupdate",
  "compositionend",
  "beforeinput",
  "input",
] as const;

function inputDetail(event: InputEvent): Record<string, unknown> {
  return {
    inputType: event.inputType,
    data: event.data,
    isComposing: event.isComposing,
    defaultPrevented: event.defaultPrevented,
  };
}

function compositionDetail(event: CompositionEvent): Record<string, unknown> {
  return {
    data: event.data,
  };
}

function keyDetail(event: KeyboardEvent): Record<string, unknown> {
  return {
    key: event.key,
    code: event.code,
    keyCode: event.keyCode,
    isComposing: event.isComposing,
  };
}

/**
 * Records DOM (capture + bubble) for Slate #5989 debugging.
 */
export function SlateCompositionDebugPlugin({
  log,
  editable,
  label = "slate-debug",
}: {
  log: SlateCompositionDebugLog;
  editable: HTMLElement | null;
  label?: string;
}) {
  const editor = useSlateStatic();

  useEffect(() => {
    if (!editable) {
      return;
    }

    const push = (
      source: SlateCompositionDebugEntry["source"],
      event: string,
      detail: Record<string, unknown>,
    ) => {
      log.entries.push({
        seq: log.entries.length + 1,
        t: performance.now(),
        source,
        event: `${label}:${event}`,
        detail,
        snapshot: readSlateCompositionSnapshot(editor, editable),
      });
    };

    const captureHandlers = DOM_TYPES.map((type) => {
      const handler = (event: Event) => {
        if (event instanceof InputEvent) {
          push("dom-capture", type, inputDetail(event));
          return;
        }
        if (event instanceof CompositionEvent) {
          push("dom-capture", type, compositionDetail(event));
          return;
        }
        if (event instanceof KeyboardEvent) {
          push("dom-capture", type, keyDetail(event));
        }
      };
      editable.addEventListener(type, handler, true);
      return () => editable.removeEventListener(type, handler, true);
    });

    const bubbleHandlers = DOM_TYPES.map((type) => {
      const handler = (event: Event) => {
        if (event instanceof InputEvent) {
          push("dom-bubble", type, inputDetail(event));
          return;
        }
        if (event instanceof CompositionEvent) {
          push("dom-bubble", type, compositionDetail(event));
          return;
        }
        if (event instanceof KeyboardEvent) {
          push("dom-bubble", type, keyDetail(event));
        }
      };
      editable.addEventListener(type, handler, false);
      return () => editable.removeEventListener(type, handler, false);
    });

    return () => {
      for (const remove of [...captureHandlers, ...bubbleHandlers]) {
        remove();
      }
    };
  }, [editable, editor, label, log]);

  return null;
}

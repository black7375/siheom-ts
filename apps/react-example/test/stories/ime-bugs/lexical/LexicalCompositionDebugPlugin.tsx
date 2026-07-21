import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  BEFORE_INPUT_COMMAND,
  COMPOSITION_END_COMMAND,
  COMPOSITION_START_COMMAND,
  CONTROLLED_TEXT_INSERTION_COMMAND,
  INPUT_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_EDITOR,
} from "lexical";

import type { LexicalCompositionDebugEntry, LexicalCompositionDebugLog } from "./lexicalCompositionDebugLog";
import { readLexicalCompositionSnapshot } from "./readLexicalCompositionSnapshot";

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
 * Records DOM (capture + bubble) and Lexical command flow for composition debugging.
 * See Lexical `LexicalEvents.ts`: Firefox defers compositionend (`ending-firefox`),
 * `$handleInput` on `INPUT_COMMAND`, NBSP sentinel on `CONTROLLED_TEXT_INSERTION_COMMAND`.
 */
export function LexicalCompositionDebugPlugin({
  log,
  label = "lexical-debug",
}: {
  log: LexicalCompositionDebugLog;
  label?: string;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const push = (
      source: LexicalCompositionDebugEntry["source"],
      event: string,
      detail: Record<string, unknown>,
    ) => {
      log.entries.push({
        seq: log.entries.length + 1,
        t: performance.now(),
        source,
        event: `${label}:${event}`,
        detail,
        snapshot: readLexicalCompositionSnapshot(editor),
      });
    };

    const removeRootListener = editor.registerRootListener((root) => {
      if (!root) {
        return;
      }

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
        root.addEventListener(type, handler, true);
        return () => root.removeEventListener(type, handler, true);
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
        root.addEventListener(type, handler, false);
        return () => root.removeEventListener(type, handler, false);
      });

      return () => {
        for (const remove of [...captureHandlers, ...bubbleHandlers]) {
          remove();
        }
      };
    });

    const removeCompositionStart = editor.registerCommand(
      COMPOSITION_START_COMMAND,
      (event) => {
        push("command", "COMPOSITION_START_COMMAND", compositionDetail(event));
        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    const removeCompositionEnd = editor.registerCommand(
      COMPOSITION_END_COMMAND,
      (event) => {
        push("command", "COMPOSITION_END_COMMAND", compositionDetail(event));
        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    const removeBeforeInput = editor.registerCommand(
      BEFORE_INPUT_COMMAND,
      (event) => {
        if (event instanceof InputEvent) {
          push("command", "BEFORE_INPUT_COMMAND", inputDetail(event));
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    const removeInput = editor.registerCommand(
      INPUT_COMMAND,
      (event) => {
        if (event instanceof InputEvent) {
          push("command", "INPUT_COMMAND", inputDetail(event));
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    const removeControlledInsert = editor.registerCommand(
      CONTROLLED_TEXT_INSERTION_COMMAND,
      (payload) => {
        push("command", "CONTROLLED_TEXT_INSERTION_COMMAND", {
          payload:
            typeof payload === "string"
              ? payload
              : payload instanceof InputEvent
                ? payload.data
                : String(payload),
        });
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );

    return () => {
      removeRootListener();
      removeCompositionStart();
      removeCompositionEnd();
      removeBeforeInput();
      removeInput();
      removeControlledInsert();
    };
  }, [editor, label, log]);

  return null;
}

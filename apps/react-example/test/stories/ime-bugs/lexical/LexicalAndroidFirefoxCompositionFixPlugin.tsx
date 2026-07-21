import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  CONTROLLED_TEXT_INSERTION_COMMAND,
  INPUT_COMMAND,
  $setCompositionKey,
} from "lexical";

const NBSP = "\u00a0";
const ZWSP = "\u200b";
const LEXICAL_FF_SENTINEL = `${NBSP}${ZWSP}`;

function isCompositionSentinel(text: string | null | undefined): boolean {
  if (!text) return false;
  return text === NBSP || text === ZWSP || text === LEXICAL_FF_SENTINEL;
}

/**
 * Lexical #6377 workaround for Android Firefox + contenteditable:
 * 1. Skip Firefox COMPOSITION_START_CHAR (NBSP) controlled insertion.
 * 2. Clear compositionKey after composing input (Android Chrome upstream mitigation).
 */
export function LexicalAndroidFirefoxCompositionFixPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const removeSentinelInsert = editor.registerCommand(
      CONTROLLED_TEXT_INSERTION_COMMAND,
      (payload) => {
        const text =
          typeof payload === "string"
            ? payload
            : payload instanceof InputEvent
              ? payload.data
              : null;
        if (isCompositionSentinel(text)) {
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );

    const clearCompositionKeyOnInput = editor.registerCommand(
      INPUT_COMMAND,
      (event) => {
        if (!(event instanceof InputEvent)) {
          return false;
        }
        if (event.inputType !== "insertCompositionText") {
          return false;
        }
        if (!editor.isComposing()) {
          return false;
        }
        editor.update(() => {
          $setCompositionKey(null);
        });
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      removeSentinelInsert();
      clearCompositionKeyOnInput();
    };
  }, [editor]);

  return null;
}

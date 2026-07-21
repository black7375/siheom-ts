import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { COMMAND_PRIORITY_HIGH, CONTROLLED_TEXT_INSERTION_COMMAND } from "lexical";

const NBSP = "\u00a0";
const ZWSP = "\u200b";
const LEXICAL_FF_SENTINEL = `${NBSP}${ZWSP}`;

function isCompositionSentinel(text: string | null | undefined): boolean {
  if (!text) return false;
  return text === NBSP || text === ZWSP || text === LEXICAL_FF_SENTINEL;
}

/**
 * Lexical #6377 workaround: skip Firefox COMPOSITION_START_CHAR (NBSP) controlled
 * insertion that breaks Android Firefox Hangul when IS_ANDROID_CHROME mitigations
 * do not apply.
 */
export function LexicalAndroidFirefoxCompositionFixPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
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
  }, [editor]);

  return null;
}

import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  COMMAND_PRIORITY_CRITICAL,
  CONTROLLED_TEXT_INSERTION_COMMAND,
  INPUT_COMMAND,
} from "lexical";

import type { LexicalCompositionDebugLog } from "./lexicalCompositionDebugLog";
import { readLexicalCompositionSnapshot } from "./readLexicalCompositionSnapshot";

const NBSP = "\u00a0";
const ZWSP = "\u200b";
const LEXICAL_FF_SENTINEL = `${NBSP}${ZWSP}`;

type LexicalEditorWithInputState = ReturnType<typeof useLexicalComposerContext>[0] & {
  _inputState?: { compositionPhase: string };
};

function isFirefoxNbspSentinel(text: string | null | undefined): boolean {
  if (!text) return false;
  return text === NBSP || text === LEXICAL_FF_SENTINEL;
}

function rewriteAfBrokenPrefix(text: string): string | null {
  if (!text.startsWith("ㅏ")) {
    return null;
  }
  return `가${text.slice(1)}`;
}

/**
 * Lexical #6377 workaround — hooks documented in Lexical `LexicalEvents.ts`:
 * - NBSP sentinel → ZWSP anchor
 * - Skip Firefox deferred lone-jamo commit (`ending-firefox` + insertCompositionText)
 * - Rewrite AF v1 preedit prefix ㅏ… → 가…
 */
export function LexicalAndroidFirefoxCompositionFixPlugin({
  debugLog,
}: {
  debugLog?: LexicalCompositionDebugLog;
} = {}) {
  const [editor] = useLexicalComposerContext();
  const pendingLoneJamoRef = useRef<string | null>(null);

  useEffect(() => {
    const note = (action: string, detail: Record<string, unknown>) => {
      debugLog?.entries.push({
        seq: debugLog.entries.length + 1,
        t: performance.now(),
        source: "command",
        event: `fix-plugin:${action}`,
        detail,
        snapshot: readLexicalCompositionSnapshot(editor),
      });
    };

    const removeSentinelInsert = editor.registerCommand(
      CONTROLLED_TEXT_INSERTION_COMMAND,
      (payload) => {
        const text =
          typeof payload === "string"
            ? payload
            : payload instanceof InputEvent
              ? payload.data
              : null;
        if (isFirefoxNbspSentinel(text)) {
          note("replace-nbsp-sentinel", { from: text, to: ZWSP });
          editor.dispatchCommand(CONTROLLED_TEXT_INSERTION_COMMAND, ZWSP);
          return true;
        }

        if (text) {
          const rewritten = rewriteAfBrokenPrefix(text);
          if (rewritten !== null) {
            const snapshot = readLexicalCompositionSnapshot(editor);
            if (snapshot.rootText === rewritten) {
              note("skip-redundant-af-commit", { payload: text, root: snapshot.rootText });
              return true;
            }
            note("rewrite-controlled-insert", { from: text, to: rewritten });
            editor.dispatchCommand(CONTROLLED_TEXT_INSERTION_COMMAND, rewritten);
            return true;
          }
        }

        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );

    const removeInputFix = editor.registerCommand(
      INPUT_COMMAND,
      (event) => {
        if (!(event instanceof InputEvent)) {
          return false;
        }
        if (event.inputType !== "insertCompositionText") {
          return false;
        }

        const data = event.data ?? "";
        const inputState = (editor as LexicalEditorWithInputState)._inputState;
        const phase = inputState?.compositionPhase ?? "unknown";
        const snapshot = readLexicalCompositionSnapshot(editor);

        if (!event.isComposing) {
          if (phase === "ending-firefox" && data && [...data].length === 1 && data === "ㄱ") {
            pendingLoneJamoRef.current = data;
            note("skip-deferred-lone-jamo", { data, phase });
            return true;
          }
          return false;
        }

        const visible = snapshot.rootText.replace(/[\u200b\u00a0]/g, "");
        let transformed: string | null = null;
        if (data.startsWith("ㅏ")) {
          if (visible.endsWith("ㄱ") || pendingLoneJamoRef.current === "ㄱ") {
            transformed = `가${data.slice(1)}`;
          } else if (visible.startsWith("가")) {
            transformed = `가${data.slice(1)}`;
          }
        }
        if (transformed !== null) {
          note("rewrite-preedit", {
            from: data,
            to: transformed,
            phase,
            pending: pendingLoneJamoRef.current,
          });
          editor.dispatchCommand(CONTROLLED_TEXT_INSERTION_COMMAND, transformed);
          pendingLoneJamoRef.current = null;
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );

    return () => {
      removeSentinelInsert();
      removeInputFix();
    };
  }, [debugLog, editor]);

  return null;
}

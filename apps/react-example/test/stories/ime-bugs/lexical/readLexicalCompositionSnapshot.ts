import type { LexicalEditor } from "lexical";
import { $getRoot } from "lexical";

/** Mirrors Lexical `InputState` fields we care about for composition debugging. */
export type LexicalInputStateSnapshot = {
  compositionPhase: string;
  compositionEndData: string;
  hadOrphanedCompositionEvents: boolean;
};

export type LexicalCompositionSnapshot = {
  rootText: string;
  domText: string;
  isComposing: boolean;
  inputState: LexicalInputStateSnapshot;
};

type LexicalEditorWithInputState = LexicalEditor & {
  _inputState?: {
    compositionPhase: string;
    compositionEndData: string;
    hadOrphanedCompositionEvents: boolean;
  };
};

function stripInvisible(text: string): string {
  return text.replace(/[\u200b\u00a0]/g, "");
}

export function readLexicalCompositionSnapshot(editor: LexicalEditor): LexicalCompositionSnapshot {
  const internal = editor as LexicalEditorWithInputState;
  let rootText = "";

  editor.getEditorState().read(() => {
    rootText = $getRoot().getTextContent();
  });

  const inputState = internal._inputState;

  return {
    rootText: stripInvisible(rootText),
    domText: stripInvisible(editor.getRootElement()?.textContent ?? ""),
    isComposing: editor.isComposing(),
    inputState: {
      compositionPhase: inputState?.compositionPhase ?? "unknown",
      compositionEndData: inputState?.compositionEndData ?? "",
      hadOrphanedCompositionEvents: inputState?.hadOrphanedCompositionEvents ?? false,
    },
  };
}

import type { Editor } from "@tiptap/react";

export type TipTapCompositionSnapshot = {
  editorText: string;
  domText: string;
  isComposing: boolean;
  /** Prefer listItem/heading when the caret is inside one (for #6825). */
  nodeType: string;
};

export function readTipTapCompositionSnapshot(editor: Editor): TipTapCompositionSnapshot {
  const { view } = editor;

  return {
    editorText: editor.getText(),
    domText: view.dom.textContent ?? "",
    isComposing: view.composing,
    nodeType: readCaretBlockType(editor),
  };
}

function readCaretBlockType(editor: Editor): string {
  const $from = editor.state.selection.$from;
  for (let depth = $from.depth; depth > 0; depth--) {
    const name = $from.node(depth).type.name;
    if (name === "listItem" || name === "heading") {
      return name;
    }
  }
  return $from.parent.type.name;
}

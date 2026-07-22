import type { Editor } from "@tiptap/react";

export type TipTapCompositionSnapshot = {
  editorText: string;
  domText: string;
  isComposing: boolean;
  nodeType: string;
};

export function readTipTapCompositionSnapshot(editor: Editor): TipTapCompositionSnapshot {
  const { state, view } = editor;
  const $from = state.selection.$from;

  return {
    editorText: editor.getText(),
    domText: view.dom.textContent ?? "",
    isComposing: view.composing,
    nodeType: $from.parent.type.name,
  };
}

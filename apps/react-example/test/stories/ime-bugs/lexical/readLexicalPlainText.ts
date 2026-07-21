import type { LexicalEditor } from "lexical";
import { $getRoot } from "lexical";

export function readLexicalPlainText(editor: LexicalEditor): string {
  let text = "";
  editor.getEditorState().read(() => {
    text = $getRoot().getTextContent();
  });
  return text.replace(/\u200b/g, "");
}

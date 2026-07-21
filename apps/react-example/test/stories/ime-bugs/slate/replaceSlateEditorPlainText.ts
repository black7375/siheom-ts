import "./slate-custom-types";

import type { Editor as SlateEditor } from "slate";
import { Editor, Transforms } from "slate";
import type { Descendant } from "slate";
import { ReactEditor } from "slate-react";

/** Replace entire editor document with a single paragraph of plain text. */
export function replaceSlateEditorPlainText(editor: SlateEditor, text: string): void {
  Editor.withoutNormalizing(editor, () => {
    const children = editor.children as Descendant[];
    for (let index = children.length - 1; index >= 0; index -= 1) {
      Transforms.removeNodes(editor, { at: [index] });
    }
    Transforms.insertNodes(editor, {
      type: "paragraph",
      children: [{ text }],
    });
  });
  ReactEditor.focus(editor);
}

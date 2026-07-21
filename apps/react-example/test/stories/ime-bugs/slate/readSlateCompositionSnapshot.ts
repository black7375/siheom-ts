import type { Editor } from "slate";
import { Node } from "slate";
import { ReactEditor } from "slate-react";

import { readSlatePlainText } from "./readSlatePlainText";
import { stripInvisible } from "./fixSlatePlaceholderHangulText";

export type SlateCompositionSnapshot = {
  slateText: string;
  domText: string;
  domRaw: string;
  placeholderPresent: boolean;
  placeholderDisplay: string | null;
  selection: { path: number[]; offset: number } | null;
  isComposing: boolean;
};

function readSelection(editor: Editor): SlateCompositionSnapshot["selection"] {
  const sel = editor.selection;
  if (!sel) {
    return null;
  }
  return {
    path: [...sel.anchor.path],
    offset: sel.anchor.offset,
  };
}

export function readSlateCompositionSnapshot(
  editor: Editor,
  editable: HTMLElement | null,
): SlateCompositionSnapshot {
  const placeholder = editable?.querySelector(
    "[data-slate-placeholder]",
  ) as HTMLElement | null;

  return {
    slateText: stripInvisible(Node.string(editor)),
    domText: stripInvisible(readSlatePlainText(editable)),
    domRaw: editable?.textContent ?? "",
    placeholderPresent: placeholder !== null,
    placeholderDisplay: placeholder ? placeholder.style.display || "visible" : null,
    selection: readSelection(editor),
    isComposing: ReactEditor.isComposing(editor),
  };
}

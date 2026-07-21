import type { Editor } from "slate";
import { Node } from "slate";

import { readSlatePlainText } from "./readSlatePlainText";
import { stripInvisible } from "./fixSlatePlaceholderHangulText";

export type SlateFixPluginStateSnapshot = {
  compositionData: string;
  committed: string;
};

export type SlateCompositionSnapshot = {
  /** Slate document plain text (`Node.string`). */
  slateText: string;
  /** DOM text excluding `[data-slate-placeholder]`. */
  domText: string;
  /** Raw DOM textContent (may include placeholder / ZWSP). */
  domRaw: string;
  fix: Omit<SlateFixPluginStateSnapshot, never> | null;
};

export function readSlateCompositionSnapshot(
  editor: Editor,
  editable: HTMLElement | null,
  fixState: SlateFixPluginStateSnapshot | null = null,
): SlateCompositionSnapshot {
  return {
    slateText: stripInvisible(Node.string(editor)),
    domText: stripInvisible(readSlatePlainText(editable)),
    domRaw: editable?.textContent ?? "",
    fix: fixState
      ? {
          compositionData: fixState.compositionData,
          committed: fixState.committed,
        }
      : null,
  };
}

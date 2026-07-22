import type { Editor } from "slate";
import { Node } from "slate";
import { ReactEditor } from "slate-react";
import {
  EDITOR_TO_PENDING_ACTION,
  EDITOR_TO_PENDING_DIFFS,
  EDITOR_TO_PENDING_SELECTION,
  IS_ANDROID,
  IS_COMPOSING,
  IS_FOCUSED,
} from "slate-dom";

import { readSlatePlainText } from "./readSlatePlainText";
import { readSlateFixDebugState } from "./slateFixDebugState";
import { stripInvisible } from "./fixSlatePlaceholderHangulText";

export type SlateCompositionSnapshot = {
  slateText: string;
  domText: string;
  domRaw: string;
  placeholderPresent: boolean;
  placeholderDisplay: string | null;
  selection: { path: number[]; offset: number; focusPath: number[]; focusOffset: number } | null;
  domSelection: { anchorOffset: number; focusOffset: number; collapsed: boolean } | null;
  isComposingReact: boolean;
  isComposingWeak: boolean;
  isAndroid: boolean;
  isFocused: boolean;
  pendingDiffCount: number;
  hasPendingAction: boolean;
  hasPendingSelection: boolean;
  committedHangul: string;
  lastFixAction: string | null;
  slateDocument: unknown;
};

function readSelection(editor: Editor): SlateCompositionSnapshot["selection"] {
  const sel = editor.selection;
  if (!sel) {
    return null;
  }
  return {
    path: [...sel.anchor.path],
    offset: sel.anchor.offset,
    focusPath: [...sel.focus.path],
    focusOffset: sel.focus.offset,
  };
}

function readDomSelection(editable: HTMLElement | null): SlateCompositionSnapshot["domSelection"] {
  if (!editable) {
    return null;
  }

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  if (!editable.contains(range.startContainer) && !editable.contains(range.endContainer)) {
    return null;
  }

  return {
    anchorOffset: selection.anchorOffset,
    focusOffset: selection.focusOffset,
    collapsed: selection.isCollapsed,
  };
}

/** Small snapshot for JSON export (fix-plugin rows only). */
export type SlateDebugSnapshotCompact = {
  slateText: string;
  isComposingWeak: boolean;
  isComposingReact: boolean;
  pendingDiffCount: number;
  committedHangul: string;
};

/** Model + weak-map reads only — safe inside IME event handlers. */
export function readSlateCompositionSnapshotModelOnly(
  editor: Editor,
): Pick<
  SlateCompositionSnapshot,
  | "slateText"
  | "isComposingReact"
  | "isComposingWeak"
  | "isAndroid"
  | "isFocused"
  | "pendingDiffCount"
  | "hasPendingAction"
  | "hasPendingSelection"
  | "committedHangul"
  | "lastFixAction"
  | "selection"
> {
  const fix = readSlateFixDebugState(editor);

  return {
    slateText: stripInvisible(Node.string(editor)),
    selection: readSelection(editor),
    isComposingReact: ReactEditor.isComposing(editor),
    isComposingWeak: Boolean(IS_COMPOSING.get(editor)),
    isAndroid: IS_ANDROID,
    isFocused: Boolean(IS_FOCUSED.get(editor)),
    pendingDiffCount: EDITOR_TO_PENDING_DIFFS.get(editor)?.length ?? 0,
    hasPendingAction: Boolean(EDITOR_TO_PENDING_ACTION.get(editor)),
    hasPendingSelection: Boolean(EDITOR_TO_PENDING_SELECTION.get(editor)),
    committedHangul: fix.committedHangul,
    lastFixAction: fix.lastFixAction?.action ?? null,
  };
}

export function compactSlateDebugSnapshot(
  snap: Pick<
    SlateCompositionSnapshot,
    "slateText" | "isComposingWeak" | "isComposingReact" | "pendingDiffCount" | "committedHangul"
  >,
): SlateDebugSnapshotCompact {
  return {
    slateText: snap.slateText,
    isComposingWeak: snap.isComposingWeak,
    isComposingReact: snap.isComposingReact,
    pendingDiffCount: snap.pendingDiffCount,
    committedHangul: snap.committedHangul,
  };
}

function readDomTextPassive(editable: HTMLElement | null): string {
  if (!editable) {
    return "";
  }

  let text = editable.textContent ?? "";
  const placeholderText = editable.querySelector("[data-slate-placeholder]")?.textContent;
  if (placeholderText && text.startsWith(placeholderText)) {
    text = text.slice(placeholderText.length);
  }

  return stripInvisible(text);
}

function readPlaceholderFlags(
  editable: HTMLElement | null,
  passive: boolean,
): {
  placeholderPresent: boolean;
  placeholderDisplay: string | null;
} {
  const placeholder = editable?.querySelector("[data-slate-placeholder]") as HTMLElement | null;

  if (!placeholder) {
    return { placeholderPresent: false, placeholderDisplay: null };
  }

  const display = passive
    ? placeholder.style.display || null
    : placeholder.style.display || window.getComputedStyle(placeholder).display;

  return {
    placeholderPresent: true,
    placeholderDisplay: display || "visible",
  };
}

/** Rich Slate + DOM snapshot for device debugging (export with IME JSON). */
export function readSlateCompositionSnapshot(
  editor: Editor,
  editable: HTMLElement | null,
  options?: { passive?: boolean },
): SlateCompositionSnapshot {
  const passive = options?.passive ?? false;
  const placeholder = readPlaceholderFlags(editable, passive);
  const fix = readSlateFixDebugState(editor);

  return {
    slateText: stripInvisible(Node.string(editor)),
    domText: passive ? readDomTextPassive(editable) : stripInvisible(readSlatePlainText(editable)),
    domRaw: editable?.textContent ?? "",
    ...placeholder,
    selection: readSelection(editor),
    domSelection: passive ? null : readDomSelection(editable),
    isComposingReact: ReactEditor.isComposing(editor),
    isComposingWeak: Boolean(IS_COMPOSING.get(editor)),
    isAndroid: IS_ANDROID,
    isFocused: Boolean(IS_FOCUSED.get(editor)),
    pendingDiffCount: EDITOR_TO_PENDING_DIFFS.get(editor)?.length ?? 0,
    hasPendingAction: Boolean(EDITOR_TO_PENDING_ACTION.get(editor)),
    hasPendingSelection: Boolean(EDITOR_TO_PENDING_SELECTION.get(editor)),
    committedHangul: fix.committedHangul,
    lastFixAction: fix.lastFixAction?.action ?? null,
    slateDocument: passive ? null : safeCloneDocument(editor.children),
  };
}

function safeCloneDocument(children: unknown): unknown {
  try {
    return structuredClone(children);
  } catch {
    try {
      return JSON.parse(JSON.stringify(children));
    } catch {
      return null;
    }
  }
}

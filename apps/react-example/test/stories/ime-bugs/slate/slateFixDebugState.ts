import type { Editor } from "slate";

export type SlateFixDebugNote = {
  action: string;
  detail: Record<string, unknown>;
  t: number;
};

const committedHangulByEditor = new WeakMap<Editor, string>();
const lastFixActionByEditor = new WeakMap<Editor, SlateFixDebugNote>();
const fixActionHistoryByEditor = new WeakMap<Editor, SlateFixDebugNote[]>();

const MAX_FIX_HISTORY = 200;

export function setSlateFixCommittedHangul(editor: Editor, committed: string): void {
  committedHangulByEditor.set(editor, committed);
}

export function noteSlateFixAction(
  editor: Editor,
  action: string,
  detail: Record<string, unknown>,
): void {
  const note: SlateFixDebugNote = {
    action,
    detail,
    t: performance.now(),
  };
  lastFixActionByEditor.set(editor, note);
  const history = fixActionHistoryByEditor.get(editor) ?? [];
  history.push(note);
  if (history.length > MAX_FIX_HISTORY) {
    history.splice(0, history.length - MAX_FIX_HISTORY);
  }
  fixActionHistoryByEditor.set(editor, history);
}

export function clearSlateFixDebugState(editor: Editor): void {
  committedHangulByEditor.delete(editor);
  lastFixActionByEditor.delete(editor);
  fixActionHistoryByEditor.delete(editor);
}

export function readSlateFixDebugState(editor: Editor): {
  committedHangul: string;
  lastFixAction: SlateFixDebugNote | null;
  fixActionCount: number;
} {
  return {
    committedHangul: committedHangulByEditor.get(editor) ?? "",
    lastFixAction: lastFixActionByEditor.get(editor) ?? null,
    fixActionCount: fixActionHistoryByEditor.get(editor)?.length ?? 0,
  };
}

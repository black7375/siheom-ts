import type { SlateCompositionSnapshot } from "./readSlateCompositionSnapshot";
import { readSlateFixActionHistory } from "./slateFixDebugState";
import type { Editor } from "slate";

export type SlateCompositionDebugEntry = {
  seq: number;
  t: number;
  source: "dom-capture" | "dom-bubble" | "fix-plugin";
  event: string;
  detail: Record<string, unknown>;
  snapshot?: Partial<SlateCompositionSnapshot>;
};

export type SlateCompositionDebugExport = {
  entryCount: number;
  fixActionCount: number;
  entries: SlateCompositionDebugEntry[];
  fixActions: ReturnType<typeof readSlateFixActionHistory>;
  summary: {
    lastSlateText: string | null;
    lastDomText: string | null;
    lastCommittedHangul: string | null;
    mismatchCount: number;
  };
};

export type SlateCompositionDebugLog = {
  entries: SlateCompositionDebugEntry[];
  clear(): void;
  dump(): string;
  toExport(editor?: Editor): SlateCompositionDebugExport;
};

function summarize(entries: SlateCompositionDebugEntry[]): SlateCompositionDebugExport["summary"] {
  const withSnap = [...entries].reverse().find((entry) => entry.snapshot);
  let mismatchCount = 0;
  for (const entry of entries) {
    if (!entry.snapshot) {
      continue;
    }
    if (entry.snapshot.slateText !== entry.snapshot.domText) {
      mismatchCount += 1;
    }
  }

  return {
    lastSlateText: withSnap?.snapshot?.slateText ?? null,
    lastDomText: withSnap?.snapshot?.domText ?? null,
    lastCommittedHangul: withSnap?.snapshot?.committedHangul ?? null,
    mismatchCount,
  };
}

export function createSlateCompositionDebugLog(): SlateCompositionDebugLog {
  const entries: SlateCompositionDebugEntry[] = [];

  return {
    entries,
    clear() {
      entries.length = 0;
    },
    dump() {
      return entries
        .map((entry) => {
          const snap = entry.snapshot
            ? ` slate="${entry.snapshot.slateText}" dom="${entry.snapshot.domText}" raw=${JSON.stringify(entry.snapshot.domRaw)} ph=${entry.snapshot.placeholderPresent}:${entry.snapshot.placeholderDisplay} weak=${entry.snapshot.isComposingWeak} react=${entry.snapshot.isComposingReact} pending=${entry.snapshot.pendingDiffCount} action=${entry.snapshot.hasPendingAction} committed="${entry.snapshot.committedHangul}" fix=${entry.snapshot.lastFixAction ?? "-"} sel=${JSON.stringify(entry.snapshot.selection)} domSel=${JSON.stringify(entry.snapshot.domSelection)}`
            : "";
          return `${entry.seq}\t${entry.event}\t${entry.source}\t${JSON.stringify(entry.detail)}${snap}`;
        })
        .join("\n");
    },
    toExport(editor?: Editor) {
      const exported = {
        entryCount: entries.length,
        fixActionCount: editor ? readSlateFixActionHistory(editor).length : 0,
        entries: [...entries],
        fixActions: editor ? readSlateFixActionHistory(editor) : [],
        summary: summarize(entries),
      };
      return exported;
    },
  };
}

/** Push a fix-plugin trace row (called from placeholder composition fix hook). */
export function pushSlateFixDebugEntry(
  log: SlateCompositionDebugLog,
  label: string,
  action: string,
  detail: Record<string, unknown>,
  snapshot?: SlateCompositionSnapshot,
): void {
  log.entries.push({
    seq: log.entries.length + 1,
    t: performance.now(),
    source: "fix-plugin",
    event: `${label}:fix:${action}`,
    detail,
    snapshot,
  });
}

/** Push Slate snapshot alongside an IME capture-shell event (no extra DOM listeners). */
export function pushSlateImeDebugEntry(
  log: SlateCompositionDebugLog,
  label: string,
  record: { type: string; [key: string]: unknown },
  snapshot?: Partial<SlateCompositionSnapshot>,
): void {
  log.entries.push({
    seq: log.entries.length + 1,
    t: performance.now(),
    source: "dom-capture",
    event: `${label}:${record.type}`,
    detail: record,
    snapshot,
  });
}

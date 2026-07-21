import type { SlateDebugSnapshotCompact } from "./readSlateCompositionSnapshot";
import {
  compactSlateDebugSnapshot,
  readSlateCompositionSnapshot,
  type SlateCompositionSnapshot,
} from "./readSlateCompositionSnapshot";
import type { Editor } from "slate";

export type SlateCompositionDebugEntry = {
  seq: number;
  t: number;
  action: string;
  detail: Record<string, unknown>;
  snap?: SlateDebugSnapshotCompact;
};

export type SlateCompositionDebugExport = {
  /** DOM IME rows live in top-level `events[]` — not duplicated here. */
  imeEventCount: number | null;
  fixTrace: SlateCompositionDebugEntry[];
  summary: {
    lastSlateText: string | null;
    lastCommittedHangul: string | null;
    fixStepCount: number;
  };
  /** Passive Slate+DOM read at download time. */
  final?: Pick<
    SlateCompositionSnapshot,
    "slateText" | "domText" | "placeholderPresent" | "placeholderDisplay" | "pendingDiffCount"
  >;
};

export type SlateCompositionDebugLog = {
  entries: SlateCompositionDebugEntry[];
  clear(): void;
  dump(): string;
  toExport(
    editor?: Editor,
    options?: { editable?: HTMLElement | null; imeEventCount?: number },
  ): SlateCompositionDebugExport;
};

function summarize(entries: SlateCompositionDebugEntry[]): SlateCompositionDebugExport["summary"] {
  const last = entries.at(-1);

  return {
    lastSlateText: last?.snap?.slateText ?? null,
    lastCommittedHangul: last?.snap?.committedHangul ?? null,
    fixStepCount: entries.length,
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
          const snap = entry.snap
            ? ` slate="${entry.snap.slateText}" weak=${entry.snap.isComposingWeak} react=${entry.snap.isComposingReact} pending=${entry.snap.pendingDiffCount} committed="${entry.snap.committedHangul}"`
            : "";
          return `${entry.seq}\t${entry.action}\t${JSON.stringify(entry.detail)}${snap}`;
        })
        .join("\n");
    },
    toExport(editor, options) {
      const fixTrace = [...entries];
      const exported: SlateCompositionDebugExport = {
        imeEventCount: options?.imeEventCount ?? null,
        fixTrace,
        summary: summarize(fixTrace),
      };

      if (editor && options?.editable) {
        const final = readSlateCompositionSnapshot(editor, options.editable, { passive: true });
        exported.final = {
          slateText: final.slateText,
          domText: final.domText,
          placeholderPresent: final.placeholderPresent,
          placeholderDisplay: final.placeholderDisplay,
          pendingDiffCount: final.pendingDiffCount,
        };
      }

      return exported;
    },
  };
}

/** Push a fix-plugin trace row (fixed mode only). */
export function pushSlateFixDebugEntry(
  log: SlateCompositionDebugLog,
  _label: string,
  action: string,
  detail: Record<string, unknown>,
  snapshot?: Pick<
    SlateCompositionSnapshot,
    | "slateText"
    | "isComposingWeak"
    | "isComposingReact"
    | "pendingDiffCount"
    | "committedHangul"
  >,
): void {
  log.entries.push({
    seq: log.entries.length + 1,
    t: performance.now(),
    action,
    detail,
    snap: snapshot ? compactSlateDebugSnapshot(snapshot) : undefined,
  });
}

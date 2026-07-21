import type { LexicalCompositionSnapshot } from "./readLexicalCompositionSnapshot";

export type LexicalCompositionDebugEntry = {
  seq: number;
  t: number;
  source: "dom-capture" | "dom-bubble" | "command";
  event: string;
  detail: Record<string, unknown>;
  snapshot?: LexicalCompositionSnapshot;
};

export type LexicalCompositionDebugLog = {
  entries: LexicalCompositionDebugEntry[];
  clear(): void;
  dump(): string;
};

export function createLexicalCompositionDebugLog(): LexicalCompositionDebugLog {
  const entries: LexicalCompositionDebugEntry[] = [];

  return {
    entries,
    clear() {
      entries.length = 0;
    },
    dump() {
      return entries
        .map((entry) => {
          const snap = entry.snapshot
            ? ` root="${entry.snapshot.rootText}" phase=${entry.snapshot.inputState.compositionPhase} composing=${entry.snapshot.isComposing}`
            : "";
          return `${entry.seq}\t${entry.event}\t${entry.source}\t${JSON.stringify(entry.detail)}${snap}`;
        })
        .join("\n");
    },
  };
}

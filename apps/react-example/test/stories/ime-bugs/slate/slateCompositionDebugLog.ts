import type { SlateCompositionSnapshot } from "./readSlateCompositionSnapshot";

export type SlateCompositionDebugEntry = {
  seq: number;
  t: number;
  source: "dom-capture" | "dom-bubble" | "fix-plugin";
  event: string;
  detail: Record<string, unknown>;
  snapshot?: SlateCompositionSnapshot;
};

export type SlateCompositionDebugLog = {
  entries: SlateCompositionDebugEntry[];
  clear(): void;
  dump(): string;
};

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
            ? ` slate="${entry.snapshot.slateText}" dom="${entry.snapshot.domText}" raw=${JSON.stringify(entry.snapshot.domRaw)} committed="${entry.snapshot.fix?.committed ?? ""}" compositionData="${entry.snapshot.fix?.compositionData ?? ""}"`
            : "";
          return `${entry.seq}\t${entry.event}\t${entry.source}\t${JSON.stringify(entry.detail)}${snap}`;
        })
        .join("\n");
    },
  };
}

import { documentFromCommittedPreedit } from "./slatePlaceholderCompositionFix";

export type FixPairFromCapture = {
  committed: string;
  data: string;
  expectedNext: string;
  /** Pure function output at extraction time (may differ if logic changes). */
  computedNext: string;
};

type FixTraceRow = {
  action: string;
  detail: Record<string, unknown>;
};

type CaptureWithFixTrace = {
  slateDebug?: {
    fixTrace?: FixTraceRow[];
  };
};

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Experiment C — extract (committed, data) → next pairs from device fixTrace. */
export function extractFixPairsFromCapture(capture: CaptureWithFixTrace): FixPairFromCapture[] {
  const rows = capture.slateDebug?.fixTrace ?? [];

  return rows
    .filter((row) => row.action === "committed-preedit")
    .map((row) => {
      const committed = asString(row.detail.committed);
      const data = asString(row.detail.data);
      const expectedNext = asString(row.detail.next);
      return {
        committed,
        data,
        expectedNext,
        computedNext: documentFromCommittedPreedit(committed, data),
      };
    });
}

export function summarizeFixPairDrift(pairs: FixPairFromCapture[]): {
  total: number;
  driftCount: number;
  driftRate: number;
  samples: FixPairFromCapture[];
} {
  const drift = pairs.filter((pair) => pair.computedNext !== pair.expectedNext);
  return {
    total: pairs.length,
    driftCount: drift.length,
    driftRate: pairs.length === 0 ? 0 : drift.length / pairs.length,
    samples: drift.slice(0, 5),
  };
}

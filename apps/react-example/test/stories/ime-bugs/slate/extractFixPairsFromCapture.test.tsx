import { describe, expect, it } from "vitest";

import {
  extractFixPairsFromCapture,
  summarizeFixPairDrift,
} from "./extractFixPairsFromCapture";
import v3Golden from "./fixtures/android-firefox/mechanism-fix-v3-cumulative-preedit-가나다가나다.json";

/**
 * Experiment C — fix logic as pure (committed, data) → next, validated against device fixTrace.
 * Drift here means our function ≠ what device recorded when capture was taken.
 */
describe("Experiment C: fix-pair extraction from device capture", () => {
  it("extracts committed-preedit pairs from v3 capture", () => {
    const pairs = extractFixPairsFromCapture(v3Golden);
    expect(pairs.length).toBeGreaterThan(0);
    expect(pairs[0]).toMatchObject({ data: "ㄱ", expectedNext: "ㄱ" });
  });

  it("reports drift between current documentFromCommittedPreedit and device expectedNext", () => {
    const pairs = extractFixPairsFromCapture(v3Golden);
    const summary = summarizeFixPairDrift(pairs);

    expect({
      total: summary.total,
      driftCount: summary.driftCount,
      driftRate: Number(summary.driftRate.toFixed(3)),
      samples: summary.samples.map((pair) => ({
        committed: pair.committed,
        data: pair.data,
        expectedNext: pair.expectedNext,
        computedNext: pair.computedNext,
      })),
    }).toMatchInlineSnapshot(`
      {
        "driftCount": 18,
        "driftRate": 0.818,
        "samples": [
          {
            "committed": "가",
            "computedNext": "가나",
            "data": "가나",
            "expectedNext": "가가나",
          },
          {
            "committed": "가가나",
            "computedNext": "가나",
            "data": "가나",
            "expectedNext": "가가나가나",
          },
          {
            "committed": "가가나",
            "computedNext": "가낟",
            "data": "가낟",
            "expectedNext": "가가나가낟",
          },
          {
            "committed": "가가나가낟",
            "computedNext": "가낟",
            "data": "가낟",
            "expectedNext": "가가나가낟가낟",
          },
          {
            "committed": "가가나가낟",
            "computedNext": "가나다",
            "data": "가나다",
            "expectedNext": "가가나가낟가나다",
          },
        ],
        "total": 22,
      }
    `);

    // Pairs document device truth; drift is informational not pass/fail gate yet.
    expect(summary.total).toBe(22);
  });
});

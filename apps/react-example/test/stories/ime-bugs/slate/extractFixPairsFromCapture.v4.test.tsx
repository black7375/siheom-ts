import { describe, expect, it } from "vitest";

import { extractFixPairsFromCapture, summarizeFixPairDrift } from "./extractFixPairsFromCapture";
import v4Golden from "./fixtures/android-firefox/mechanism-fix-v4-still-explodes-가나다가나다.json";
import { documentFromCommittedPreedit } from "./slatePlaceholderCompositionFix";

/**
 * Experiment C (v4 device) — pure fix pairs from latest still-broken capture.
 */
describe("Experiment C v4: fix-pair drift (latest device capture)", () => {
  const pairs = extractFixPairsFromCapture(v4Golden);

  it("extracts 22 committed-preedit pairs from v4 capture", () => {
    expect(pairs).toHaveLength(22);
  });

  it("records drift vs device expectedNext at capture time", () => {
    const summary = summarizeFixPairDrift(pairs);

    expect({
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
        "driftCount": 0,
        "driftRate": 0,
        "samples": [],
      }
    `);
  });

  it("documents v4 mixed syllable+jamo preedit pairs device applied", () => {
    expect(documentFromCommittedPreedit("가간", "가ㅏ")).toBe("가간가ㅏ");
    expect(
      pairs.find((pair) => pair.committed === "가간" && pair.data === "가ㅏ")?.expectedNext,
    ).toBe("가간가ㅏ");
  });
});

import "./slateAndroidFirefoxEnv";

import { describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { measureReplayFidelity } from "@siheom/ime";

import { SlateLogger } from "./SlateLogger";
import { readSlatePlainText } from "./readSlatePlainText";
import brokenGaGolden from "./fixtures/android-firefox/broken-가-placeholder.json";
import v3Golden from "./fixtures/android-firefox/mechanism-fix-v3-cumulative-preedit-가나다가나다.json";

/**
 * Experiment A — Slate + golden replay fidelity (with bun-patched slate-react).
 * Patch improves first-syllable replay but matchRate still ≪ 1 — not a device gate.
 */
describe("Experiment A: golden replay fidelity (patched slate-react)", () => {
  async function measureOnBrokenSlate(events: { type: string; value: string; data: string | null }[]) {
    const editorRef: { current: HTMLElement | null } = { current: null };

    render(
      <SlateLogger captureTarget="slate-placeholder" editorRef={editorRef} captureExploration={false} />,
    );

    await waitFor(() => {
      expect(editorRef.current).not.toBeNull();
    });

    return measureReplayFidelity(
      editorRef.current!,
      events as Parameters<typeof measureReplayFidelity>[1],
      readSlatePlainText,
      { settle: "macrotask" },
    );
  }

  it("reports fidelity for first-hangul 가 capture (events-only)", async () => {
    const report = await measureOnBrokenSlate(brokenGaGolden.events);

    expect({
      label: "broken-가",
      total: report.totalSteps,
      matched: report.matchedSteps,
      matchRate: Number(report.matchRate.toFixed(3)),
      firstMismatch: report.firstMismatchIndex,
      sample: report.steps
        .filter((step) => !step.matched)
        .slice(0, 3)
        .map((step) => ({
          index: step.index,
          type: step.type,
          data: step.data,
          expected: step.expected,
          actual: step.actual,
        })),
    }).toMatchInlineSnapshot(`
      {
        "firstMismatch": 3,
        "label": "broken-가",
        "matchRate": 0.467,
        "matched": 7,
        "sample": [
          {
            "actual": "ㄱ",
            "data": "ㄱ",
            "expected": "",
            "index": 3,
            "type": "beforeinput",
          },
          {
            "actual": "가",
            "data": "가",
            "expected": "ㄱ",
            "index": 8,
            "type": "beforeinput",
          },
          {
            "actual": "가",
            "data": "가",
            "expected": "ㄱ",
            "index": 9,
            "type": "input",
          },
        ],
        "total": 15,
      }
    `);

    expect(report.matchRate).toBeLessThan(1);
  });

  it("reports fidelity for 가나다가나다 v3 capture (events-only)", async () => {
    const report = await measureOnBrokenSlate(v3Golden.events);

    expect({
      label: "v3-가나다가나다",
      total: report.totalSteps,
      matched: report.matchedSteps,
      matchRate: Number(report.matchRate.toFixed(3)),
      firstMismatch: report.firstMismatchIndex,
      sample: report.steps
        .filter((step) => !step.matched)
        .slice(0, 3)
        .map((step) => ({
          index: step.index,
          type: step.type,
          data: step.data,
          expected: step.expected,
          actual: step.actual,
        })),
    }).toMatchInlineSnapshot(`
      {
        "firstMismatch": 3,
        "label": "v3-가나다가나다",
        "matchRate": 0.1,
        "matched": 12,
        "sample": [
          {
            "actual": "ㄱ",
            "data": "ㄱ",
            "expected": "",
            "index": 3,
            "type": "beforeinput",
          },
          {
            "actual": "ㄱ가",
            "data": "가",
            "expected": "ㄱ",
            "index": 13,
            "type": "beforeinput",
          },
          {
            "actual": "ㄱ가",
            "data": "가",
            "expected": "가ㄱ",
            "index": 14,
            "type": "input",
          },
        ],
        "total": 120,
      }
    `);

    expect(report.matchRate).toBeLessThan(1);
  });

  it("golden writeback on plain div reaches 100% (golden self-consistency)", async () => {
    const div = document.createElement("div");
    div.contentEditable = "true";
    document.body.append(div);

    const report = await measureReplayFidelity(
      div,
      brokenGaGolden.events as Parameters<typeof measureReplayFidelity>[1],
      readSlatePlainText,
      { settle: "macrotask", writeback: "golden" },
    );

    expect(report.matchRate).toBe(1);
    div.remove();
  });
});

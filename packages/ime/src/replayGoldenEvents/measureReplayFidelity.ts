import type { ComposedEventRecord } from "../_internal/types";
import { ContentEditableImeTrace } from "../_internal/contentEditableImeTrace";
import { setInputValue } from "../_internal/events";
import { ImeTrace } from "../_internal/imeTrace";
import { isEditable } from "../withPresentElement";
import { settleAfterPreedit } from "../composeHangul/settle";
import { applyGoldenDomWriteback, stripGoldenText } from "./goldenDomWriteback";
import { playGoldenEvent, type ReplayGoldenEventsOptions } from "./replayGoldenEvents";

export type MeasureReplayFidelityOptions = ReplayGoldenEventsOptions;

export type FidelityStep = {
  index: number;
  type: string;
  data: string | null;
  expected: string;
  actual: string;
  matched: boolean;
};

export type FidelityReport = {
  totalSteps: number;
  matchedSteps: number;
  matchRate: number;
  firstMismatchIndex: number | null;
  steps: FidelityStep[];
};

/**
 * Replay golden events step-by-step and compare DOM to each event's captured `value`.
 * Experiment A: if broken-mode replay ≠ golden, Chromium replay is not device-faithful.
 */
export async function measureReplayFidelity(
  element: HTMLElement,
  events: ComposedEventRecord[],
  readDom: (element: HTMLElement) => string,
  options: MeasureReplayFidelityOptions = {},
): Promise<FidelityReport> {
  const trace = isEditable(element)
    ? new ImeTrace(element)
    : new ContentEditableImeTrace(element);
  element.focus();

  const steps: FidelityStep[] = [];
  const writeback = options.writeback ?? "none";

  for (let index = 0; index < events.length; index++) {
    const event = events[index];
    playGoldenEvent(trace, event);

    if (trace instanceof ImeTrace && event.type === "input" && event.value != null) {
      const visible = stripGoldenText(event.value);
      setInputValue(trace.element, visible, visible.length);
    }

    if (options.settle === "macrotask" && trace instanceof ContentEditableImeTrace) {
      await settleAfterPreedit("macrotask");
    }

    const expected = stripGoldenText(event.value ?? "");
    if (writeback === "golden") {
      applyGoldenDomWriteback(element, expected);
    }

    const actual = stripGoldenText(readDom(element));
    steps.push({
      index,
      type: event.type,
      data: event.data,
      expected,
      actual,
      matched: expected === actual,
    });
  }

  const matchedSteps = steps.filter((step) => step.matched).length;
  return {
    totalSteps: steps.length,
    matchedSteps,
    matchRate: steps.length === 0 ? 1 : matchedSteps / steps.length,
    firstMismatchIndex: steps.find((step) => !step.matched)?.index ?? null,
    steps,
  };
}

export function formatFidelityReport(report: FidelityReport, limit = 5): string {
  const lines = [
    `match ${report.matchedSteps}/${report.totalSteps} (${(report.matchRate * 100).toFixed(1)}%)`,
    `firstMismatch: ${report.firstMismatchIndex ?? "none"}`,
  ];
  if (report.firstMismatchIndex !== null) {
    const mismatches = report.steps.filter((step) => !step.matched).slice(0, limit);
    for (const step of mismatches) {
      lines.push(
        `  #${step.index} ${step.type} data=${JSON.stringify(step.data)} expected=${JSON.stringify(step.expected)} actual=${JSON.stringify(step.actual)}`,
      );
    }
  }
  return lines.join("\n");
}

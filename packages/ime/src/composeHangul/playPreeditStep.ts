import type { ImeTrace } from "../_internal/imeTrace";
import { playEventPlan } from "../_internal/eventPlan";
import { readMaxLength } from "../_internal/maxLength";
import { planChromePreeditStep } from "./planStroke";

/** Observe DOM facts and play one composition preedit step (session + preedit pulse). */
export function playPreeditStep(
  trace: ImeTrace,
  preedit: string,
  value: string,
  caret: number,
  suffix: string,
): void {
  playEventPlan(
    trace,
    planChromePreeditStep(preedit, value, caret, suffix, {
      valueBefore: trace.element.value,
      maxLength: readMaxLength(trace.element),
    }),
  );
}

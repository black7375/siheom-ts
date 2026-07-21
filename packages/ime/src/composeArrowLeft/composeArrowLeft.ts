import type { ComposedEventRecord } from "../_internal";
import { getImeSession, ImeTrace, playEventPlan, readMaxLength } from "../_internal";
import { planArrowLeft } from "./planArrowLeft";

/**
 * ArrowLeft: if composing, confirm+end composition first (ibus-hangul style), then move caret.
 */
export async function composeArrowLeft(
  element: HTMLInputElement | HTMLTextAreaElement,
): Promise<ComposedEventRecord[]> {
  const trace = new ImeTrace(element);
  const session = getImeSession(element);

  playEventPlan(
    trace,
    planArrowLeft({
      composing: Boolean(session?.composing),
      session,
      caret: element.selectionStart ?? 0,
      value: element.value,
      confirmFacts: {
        valueBefore: element.value,
        maxLength: readMaxLength(element),
      },
    }),
  );

  return trace.records;
}

import type { ComposedEventRecord } from "../_internal";
import {
  getImeSession,
  ImeTrace,
  playEventPlan,
  readMaxLength,
} from "../_internal";
import { planBackspace } from "./planBackspace";

/**
 * Hangul IME Backspace: decompose preedit while composing; otherwise deleteContentBackward.
 */
export async function composeBackspace(
  element: HTMLInputElement | HTMLTextAreaElement,
): Promise<ComposedEventRecord[]> {
  const trace = new ImeTrace(element);
  const session = getImeSession(element);

  playEventPlan(
    trace,
    planBackspace({
      composing: Boolean(session?.composing),
      session,
      value: element.value,
      selectionStart: element.selectionStart ?? element.value.length,
      selectionEnd: element.selectionEnd ?? element.value.length,
      valueBefore: element.value,
      maxLength: readMaxLength(element),
    }),
  );

  return trace.records;
}

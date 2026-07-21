import { playEventPlan } from "./eventPlan";
import type { ImeTrace } from "./imeTrace";
import { planReplacementText } from "./planMaxLength";

export type ReplacementInputType = "insertText" | "insertReplacementText";

export function replacementInputType(
  previousValue: string,
  nextValue: string,
  data: string,
): ReplacementInputType {
  if (nextValue === previousValue) {
    return "insertReplacementText";
  }
  if (
    nextValue.length > previousValue.length &&
    nextValue.startsWith(previousValue) &&
    nextValue.slice(previousValue.length) === data
  ) {
    return "insertText";
  }
  return "insertReplacementText";
}

/** Safari Apple IME: beforeinput → input without composition events. */
export function applyReplacementText(
  trace: ImeTrace,
  data: string,
  value: string,
  inputType: ReplacementInputType,
  caret: number = value.length,
) {
  playEventPlan(
    trace,
    planReplacementText(data, value, inputType, caret, trace.element.value),
  );
}

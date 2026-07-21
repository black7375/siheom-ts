import { playEventPlan } from "./eventPlan";
import type { ImeTrace } from "./imeTrace";
import { readMaxLength } from "./maxLength";
import { planPreedit } from "./planPreedit";

/** Apply one composition preedit snapshot: compositionupdate → beforeinput → value → input. */
export function applyPreedit(
  trace: ImeTrace,
  preedit: string,
  value: string,
  caret: number = value.length,
) {
  const { element } = trace;
  playEventPlan(
    trace,
    planPreedit(preedit, value, caret, {
      valueBefore: element.value,
      maxLength: readMaxLength(element),
    }),
  );
}

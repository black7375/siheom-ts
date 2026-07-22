import type { ImeTrace } from "../_internal/imeTrace";
import { playEventPlan } from "../_internal/eventPlan";
import { readMaxLength } from "../_internal/maxLength";
import type { ImeProfile } from "../profiles";
import { planChromePreeditStep } from "./planStroke";

/** Observe DOM facts and play one composition preedit step (session + preedit pulse). */
export function playPreeditStep(
  trace: ImeTrace,
  preedit: string,
  value: string,
  caret: number,
  suffix: string,
  profile?: ImeProfile,
): void {
  const valueBefore = trace.element.value;
  const omitCompositionUpdate = Boolean(profile?.postCompositionEndInput) && valueBefore === value;

  playEventPlan(
    trace,
    planChromePreeditStep(
      preedit,
      value,
      caret,
      suffix,
      {
        valueBefore,
        maxLength: readMaxLength(trace.element),
      },
      { omitCompositionUpdate },
    ),
  );
}

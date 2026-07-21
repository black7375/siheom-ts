import type { ComposedEventRecord } from "../_internal";
import { getImeSession, ImeTrace, playEventPlan, readMaxLength } from "../_internal";
import type { ImeProfile } from "../profiles";
import { planEnter } from "./planEnter";

/**
 * Enter while composing — order depends on profile facet (webkit vs chromium).
 * When not composing, fires a plain Enter keydown/keyup.
 */
export async function composeEnter(
  element: HTMLInputElement | HTMLTextAreaElement,
  profile: ImeProfile,
): Promise<ComposedEventRecord[]> {
  const trace = new ImeTrace(element);
  const session = getImeSession(element);

  playEventPlan(
    trace,
    planEnter({
      composing: Boolean(session?.composing),
      facet: profile.enterDuringComposition,
      session,
      confirmFacts: {
        valueBefore: element.value,
        maxLength: readMaxLength(element),
      },
    }),
  );

  return trace.records;
}

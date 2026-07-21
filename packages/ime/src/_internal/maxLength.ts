import type { ImeTrace } from "./imeTrace";
import { playEventPlan } from "./eventPlan";
import {
  planChromeCompositionOverflow,
  planSafariCompositionOverflow,
  planSafariReplacementOverflow,
} from "./planMaxLength";
import { getImeSession, setImeSession } from "./session";

export function readMaxLength(element: HTMLInputElement | HTMLTextAreaElement): number | null {
  const limit = element.maxLength;
  return limit < 0 ? null : limit;
}

/** Chrome / Linux composition: reject overflow with empty input data then compositionend. */
export function rejectChromeCompositionOverflow(
  trace: ImeTrace,
  preedit: string,
  overflowValue: string,
) {
  const limit = readMaxLength(trace.element);
  if (limit === null) return;
  playEventPlan(trace, planChromeCompositionOverflow(preedit, overflowValue, limit));
}

/** Safari composition: deleteCompositionText + insertFromComposition("") + compositionend. */
export function rejectSafariCompositionOverflow(
  trace: ImeTrace,
  preedit: string,
  overflowValue: string,
) {
  const limit = readMaxLength(trace.element);
  if (limit === null) return;
  playEventPlan(trace, planSafariCompositionOverflow(preedit, overflowValue, limit));
}

/** Safari replacement: reject overflow with empty insertText. */
export function rejectSafariReplacementOverflow(trace: ImeTrace) {
  playEventPlan(trace, planSafariReplacementOverflow(trace.element.value));
}

export function markPendingMaxLengthReject(
  element: HTMLInputElement | HTMLTextAreaElement,
  preedit: string,
  overflowValue: string,
) {
  const session = getImeSession(element);
  if (!session) return;
  setImeSession(element, {
    ...session,
    pendingMaxLengthReject: { preedit, overflowValue },
  });
}

export function takePendingMaxLengthReject(element: HTMLInputElement | HTMLTextAreaElement) {
  const session = getImeSession(element);
  if (!session?.pendingMaxLengthReject) return undefined;
  const pending = session.pendingMaxLengthReject;
  setImeSession(element, { ...session, pendingMaxLengthReject: undefined });
  return pending;
}

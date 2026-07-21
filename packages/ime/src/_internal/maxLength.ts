import { setInputValue } from "./events";
import type { ImeTrace } from "./imeTrace";
import { clearImeSession, getImeSession, setImeSession } from "./session";

export function readMaxLength(element: HTMLInputElement | HTMLTextAreaElement): number | null {
  const limit = element.maxLength;
  return limit < 0 ? null : limit;
}

function clampValue(value: string, limit: number): string {
  return value.slice(0, limit);
}

/** Chrome / Linux composition: reject overflow with empty input data then compositionend. */
export function rejectChromeCompositionOverflow(
  trace: ImeTrace,
  preedit: string,
  overflowValue: string,
) {
  const { element } = trace;
  const limit = readMaxLength(element);
  if (limit === null) return;

  const clamped = clampValue(overflowValue, limit);

  trace.compositionUpdate(preedit, overflowValue);
  trace.beforeInput({
    inputType: "insertCompositionText",
    data: preedit,
    isComposing: true,
    value: overflowValue,
  });

  setInputValue(element, clamped, clamped.length);
  trace.input({
    inputType: "insertCompositionText",
    data: "",
    isComposing: true,
    value: clamped,
  });

  trace.compositionEnd(preedit, clamped);
  clearImeSession(element);
}

/** Safari composition: deleteCompositionText + insertFromComposition("") + compositionend. */
export function rejectSafariCompositionOverflow(
  trace: ImeTrace,
  preedit: string,
  overflowValue: string,
) {
  const { element } = trace;
  const limit = readMaxLength(element);
  if (limit === null) return;

  const clamped = clampValue(overflowValue, limit);

  trace.compositionUpdate(preedit, overflowValue);
  trace.beforeInput({
    inputType: "insertCompositionText",
    data: preedit,
    isComposing: true,
    value: overflowValue,
  });
  trace.input({
    inputType: "insertCompositionText",
    data: preedit,
    isComposing: true,
    value: overflowValue,
  });

  trace.beforeInput({
    inputType: "deleteCompositionText",
    data: null,
    isComposing: true,
    value: overflowValue,
  });

  setInputValue(element, clamped, clamped.length);
  trace.input({
    inputType: "deleteCompositionText",
    data: null,
    isComposing: true,
    value: clamped,
  });

  trace.beforeInput({
    inputType: "insertFromComposition",
    data: "",
    isComposing: true,
    value: clamped,
  });
  trace.input({
    inputType: "insertFromComposition",
    data: "",
    isComposing: true,
    value: clamped,
  });

  trace.compositionEnd(preedit, clamped);
  clearImeSession(element);
}

/** Safari replacement: reject overflow with empty insertText. */
export function rejectSafariReplacementOverflow(trace: ImeTrace) {
  const value = trace.element.value;

  trace.beforeInput({
    inputType: "insertText",
    data: "",
    isComposing: false,
    value,
  });
  trace.input({
    inputType: "insertText",
    data: "",
    isComposing: false,
    value,
  });
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

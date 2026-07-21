import type { HangulKeyStroke } from "../planHangulKeystrokes/planHangulKeystrokes";
import { playEventPlan } from "./eventPlan";
import type { ImeTrace } from "./imeTrace";
import { readMaxLength } from "./maxLength";
import { planConfirmAndEndComposition } from "./planConfirmComposition";
import { getImeSession, setImeSession } from "./session";

/** After the first preedit of a syllable-boundary stroke, end then restart composition. */
export function commitBetweenPreeditSteps(
  trace: ImeTrace,
  stroke: HangulKeyStroke,
  value: string,
  stepIndex: number,
) {
  if (stepIndex !== 0 || stroke.commitAfterFirstStep === undefined) return;

  playEventPlan(trace, [
    { kind: "compositionend", data: stroke.commitAfterFirstStep, value },
    { kind: "compositionstart" },
  ]);
}

/** Confirm an active IME session with compositionend (Enter / ArrowLeft paths). */
export function confirmAndEndComposition(trace: ImeTrace) {
  const { element } = trace;
  const session = getImeSession(element);
  if (!session?.composing) return;

  playEventPlan(
    trace,
    planConfirmAndEndComposition(session, {
      valueBefore: element.value,
      maxLength: readMaxLength(element),
    }),
  );
}

export function updateImeSessionForPreedit(
  element: HTMLInputElement | HTMLTextAreaElement,
  preedit: string,
  value: string,
  caret: number,
  suffix: string,
) {
  const committedLen = caret - preedit.length;
  setImeSession(element, {
    composing: true,
    committed: value.slice(0, committedLen),
    preedit,
    suffix,
  });
}

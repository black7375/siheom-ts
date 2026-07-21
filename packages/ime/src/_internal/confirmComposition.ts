import type { HangulKeyStroke } from "../planHangulKeystrokes/planHangulKeystrokes";
import { applyPreedit } from "./applyPreedit";
import { setInputValue } from "./events";
import type { ImeTrace } from "./imeTrace";
import { clearImeSession, getImeSession, setImeSession } from "./session";

/** After the first preedit of a syllable-boundary stroke, end then restart composition. */
export function commitBetweenPreeditSteps(
  trace: ImeTrace,
  stroke: HangulKeyStroke,
  value: string,
  stepIndex: number,
) {
  if (stepIndex !== 0 || stroke.commitAfterFirstStep === undefined) return;

  trace.compositionEnd(stroke.commitAfterFirstStep, value);
  trace.compositionStart();
}

/** Confirm an active IME session with compositionend (Enter / ArrowLeft paths). */
export function confirmAndEndComposition(trace: ImeTrace) {
  const { element } = trace;
  const session = getImeSession(element);
  if (!session?.composing) return;

  const caret = session.committed.length + session.preedit.length;
  const value = session.committed + session.preedit + session.suffix;
  applyPreedit(trace, session.preedit, value, caret);

  trace.compositionEnd(session.preedit, value);
  clearImeSession(element);
  setInputValue(element, value, caret);
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

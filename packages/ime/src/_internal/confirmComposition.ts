import type { HangulKeyStroke } from "../planHangulKeystrokes/planHangulKeystrokes";
import type { ComposedEventRecord } from "./types";
import { applyPreedit } from "./applyPreedit";
import { dispatch, pushCompositionStart, setInputValue, snapshot } from "./events";
import { clearImeSession, getImeSession, setImeSession } from "./session";

/** After the first preedit of a syllable-boundary stroke, end then restart composition. */
export function commitBetweenPreeditSteps(
  element: HTMLInputElement | HTMLTextAreaElement,
  stroke: HangulKeyStroke,
  value: string,
  records: ComposedEventRecord[],
  stepIndex: number,
) {
  if (stepIndex !== 0 || stroke.commitAfterFirstStep === undefined) return;

  dispatch(element, "compositionend", {
    bubbles: true,
    data: stroke.commitAfterFirstStep,
  });
  records.push(
    snapshot(element, "compositionend", {
      data: stroke.commitAfterFirstStep,
      value,
    }),
  );
  pushCompositionStart(element, records);
}

/** Confirm an active IME session with compositionend (Enter / ArrowLeft paths). */
export function confirmAndEndComposition(
  element: HTMLInputElement | HTMLTextAreaElement,
  records: ComposedEventRecord[],
) {
  const session = getImeSession(element);
  if (!session?.composing) return;

  const caret = session.committed.length + session.preedit.length;
  const value = session.committed + session.preedit + session.suffix;
  applyPreedit(element, session.preedit, value, records, caret);

  dispatch(element, "compositionend", {
    bubbles: true,
    data: session.preedit,
  });
  records.push(
    snapshot(element, "compositionend", {
      data: session.preedit,
      value,
    }),
  );
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

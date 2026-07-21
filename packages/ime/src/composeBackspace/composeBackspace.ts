import { assemble } from "es-hangul";

import { hangulJamos } from "../hangulJamos";
import type { ComposedEventRecord } from "../_internal";
import {
  applyPreedit,
  clearImeSession,
  getImeSession,
  ImeTrace,
  setImeSession,
  setInputValue,
} from "../_internal";

function shrinkPreedit(preedit: string): string {
  const jamos = hangulJamos(preedit);
  if (jamos.length <= 1) return "";
  return assemble(jamos.slice(0, -1));
}

/**
 * Hangul IME Backspace: decompose preedit while composing; otherwise deleteContentBackward.
 */
export async function composeBackspace(
  element: HTMLInputElement | HTMLTextAreaElement,
): Promise<ComposedEventRecord[]> {
  const trace = new ImeTrace(element);
  const session = getImeSession(element);

  if (session?.composing) {
    trace.keydown({
      key: "Process",
      code: "Backspace",
      keyCode: 229,
      isComposing: true,
    });

    const nextPreedit = shrinkPreedit(session.preedit);
    const caret = session.committed.length + nextPreedit.length;
    const value = session.committed + nextPreedit + session.suffix;

    applyPreedit(trace, nextPreedit, value, caret);

    if (nextPreedit === "") {
      trace.compositionEnd("", value);
      clearImeSession(element);
      setInputValue(element, value, caret);

      trace.keyup({
        key: "Backspace",
        code: "Backspace",
        keyCode: 8,
        isComposing: false,
      });
      return trace.records;
    }

    setImeSession(element, { ...session, preedit: nextPreedit });

    trace.keyup({
      key: "Backspace",
      code: "Backspace",
      keyCode: 8,
      isComposing: true,
    });
    return trace.records;
  }

  trace.keydown({
    key: "Backspace",
    code: "Backspace",
    keyCode: 8,
    isComposing: false,
  });

  trace.beforeInput({
    inputType: "deleteContentBackward",
    data: null,
    isComposing: false,
  });

  const start = element.selectionStart ?? element.value.length;
  const end = element.selectionEnd ?? element.value.length;
  let nextValue = element.value;
  let nextCaret = start;
  if (start === end && start > 0) {
    nextValue = element.value.slice(0, start - 1) + element.value.slice(end);
    nextCaret = start - 1;
  } else if (start !== end) {
    nextValue = element.value.slice(0, start) + element.value.slice(end);
    nextCaret = start;
  }
  setInputValue(element, nextValue, nextCaret);

  trace.input({
    inputType: "deleteContentBackward",
    data: null,
    isComposing: false,
    value: nextValue,
  });

  trace.keyup({
    key: "Backspace",
    code: "Backspace",
    keyCode: 8,
    isComposing: false,
  });

  return trace.records;
}

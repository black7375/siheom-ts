import { assemble } from "es-hangul";

import { hangulJamos } from "./hangulProgression";
import type { ComposedEventRecord } from "./composeHangulTypes";
import {
  applyPreedit,
  dispatch,
  pushKeydown,
  pushKeyup,
  setInputValue,
  snapshot,
} from "./composeHangulInternals";
import { clearImeSession, getImeSession, setImeSession } from "./imeSession";

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
  const records: ComposedEventRecord[] = [];
  const session = getImeSession(element);

  if (session?.composing) {
    pushKeydown(element, records, {
      key: "Process",
      code: "Backspace",
      keyCode: 229,
      isComposing: true,
    });

    const nextPreedit = shrinkPreedit(session.preedit);
    const caret = session.committed.length + nextPreedit.length;
    const value = session.committed + nextPreedit + session.suffix;

    applyPreedit(element, nextPreedit, value, records, caret);

    if (nextPreedit === "") {
      dispatch(element, "compositionend", { bubbles: true, data: "" });
      records.push(snapshot(element, "compositionend", { data: "", value }));
      clearImeSession(element);
      setInputValue(element, value, caret);

      pushKeyup(element, records, {
        key: "Backspace",
        code: "Backspace",
        keyCode: 8,
        isComposing: false,
      });
      return records;
    }

    setImeSession(element, { ...session, preedit: nextPreedit });

    pushKeyup(element, records, {
      key: "Backspace",
      code: "Backspace",
      keyCode: 8,
      isComposing: true,
    });
    return records;
  }

  pushKeydown(element, records, {
    key: "Backspace",
    code: "Backspace",
    keyCode: 8,
    isComposing: false,
  });

  dispatch(element, "beforeinput", {
    bubbles: true,
    cancelable: true,
    inputType: "deleteContentBackward",
    data: null,
    isComposing: false,
  });
  records.push(
    snapshot(element, "beforeinput", {
      inputType: "deleteContentBackward",
      data: null,
      isComposing: false,
    }),
  );

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

  dispatch(element, "input", {
    bubbles: true,
    inputType: "deleteContentBackward",
    data: null,
    isComposing: false,
  });
  records.push(
    snapshot(element, "input", {
      inputType: "deleteContentBackward",
      data: null,
      isComposing: false,
      value: nextValue,
    }),
  );

  pushKeyup(element, records, {
    key: "Backspace",
    code: "Backspace",
    keyCode: 8,
    isComposing: false,
  });

  return records;
}

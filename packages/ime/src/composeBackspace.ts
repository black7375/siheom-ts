import { assemble, disassemble } from "es-hangul";

import type { ComposedEventRecord } from "./composeHangulTypes";
import { applyPreedit, dispatch, setInputValue, snapshot } from "./composeHangulInternals";
import { clearImeSession, getImeSession, setImeSession } from "./imeSession";

function hangulJamosOf(text: string): string[] {
  return disassemble(text)
    .split("")
    .filter((jamo) => jamo.trim().length > 0);
}

function shrinkPreedit(preedit: string): string {
  const jamos = hangulJamosOf(preedit);
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
    dispatch(element, "keydown", {
      bubbles: true,
      cancelable: true,
      key: "Process",
      code: "Backspace",
      keyCode: 229,
      isComposing: true,
    });
    records.push(
      snapshot(element, "keydown", {
        key: "Process",
        code: "Backspace",
        keyCode: 229,
        isComposing: true,
      }),
    );

    const nextPreedit = shrinkPreedit(session.preedit);
    const caret = session.committed.length + nextPreedit.length;
    const value = session.committed + nextPreedit + session.suffix;

    applyPreedit(element, nextPreedit, value, records, caret);

    if (nextPreedit === "") {
      dispatch(element, "compositionend", { bubbles: true, data: "" });
      records.push(snapshot(element, "compositionend", { data: "", value }));
      clearImeSession(element);
      // Caret stays at end of committed (before suffix)
      setInputValue(element, value, caret);

      dispatch(element, "keyup", {
        bubbles: true,
        key: "Backspace",
        code: "Backspace",
        keyCode: 8,
        isComposing: false,
      });
      records.push(
        snapshot(element, "keyup", {
          key: "Backspace",
          code: "Backspace",
          keyCode: 8,
          isComposing: false,
        }),
      );
      return records;
    }

    setImeSession(element, { ...session, preedit: nextPreedit });

    dispatch(element, "keyup", {
      bubbles: true,
      key: "Backspace",
      code: "Backspace",
      keyCode: 8,
      isComposing: true,
    });
    records.push(
      snapshot(element, "keyup", {
        key: "Backspace",
        code: "Backspace",
        keyCode: 8,
        isComposing: true,
      }),
    );
    return records;
  }

  // Plain deleteContentBackward
  dispatch(element, "keydown", {
    bubbles: true,
    cancelable: true,
    key: "Backspace",
    code: "Backspace",
    keyCode: 8,
    isComposing: false,
  });
  records.push(
    snapshot(element, "keydown", {
      key: "Backspace",
      code: "Backspace",
      keyCode: 8,
      isComposing: false,
    }),
  );

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

  dispatch(element, "keyup", {
    bubbles: true,
    key: "Backspace",
    code: "Backspace",
    keyCode: 8,
    isComposing: false,
  });
  records.push(
    snapshot(element, "keyup", {
      key: "Backspace",
      code: "Backspace",
      keyCode: 8,
      isComposing: false,
    }),
  );

  return records;
}

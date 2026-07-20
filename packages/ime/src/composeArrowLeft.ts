import type { ComposedEventRecord } from "./composeHangulTypes";
import { applyPreedit, dispatch, setInputValue, snapshot } from "./composeHangulInternals";
import { clearImeSession, getImeSession } from "./imeSession";

/**
 * ArrowLeft: if composing, confirm+end composition first (ibus-hangul style), then move caret.
 */
export async function composeArrowLeft(
  element: HTMLInputElement | HTMLTextAreaElement,
): Promise<ComposedEventRecord[]> {
  const records: ComposedEventRecord[] = [];
  const session = getImeSession(element);

  if (session?.composing) {
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

  dispatch(element, "keydown", {
    bubbles: true,
    cancelable: true,
    key: "ArrowLeft",
    code: "ArrowLeft",
    keyCode: 37,
    isComposing: false,
  });
  records.push(
    snapshot(element, "keydown", {
      key: "ArrowLeft",
      code: "ArrowLeft",
      keyCode: 37,
      isComposing: false,
    }),
  );

  const pos = element.selectionStart ?? 0;
  if (pos > 0) {
    setInputValue(element, element.value, pos - 1);
  }

  dispatch(element, "keyup", {
    bubbles: true,
    key: "ArrowLeft",
    code: "ArrowLeft",
    keyCode: 37,
    isComposing: false,
  });
  records.push(
    snapshot(element, "keyup", {
      key: "ArrowLeft",
      code: "ArrowLeft",
      keyCode: 37,
      isComposing: false,
    }),
  );

  return records;
}

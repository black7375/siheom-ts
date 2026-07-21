import type { ComposedEventRecord } from "../_internal";
import { confirmAndEndComposition, getImeSession, ImeTrace, setInputValue } from "../_internal";

/**
 * ArrowLeft: if composing, confirm+end composition first (ibus-hangul style), then move caret.
 */
export async function composeArrowLeft(
  element: HTMLInputElement | HTMLTextAreaElement,
): Promise<ComposedEventRecord[]> {
  const trace = new ImeTrace(element);
  const session = getImeSession(element);

  if (session?.composing) {
    confirmAndEndComposition(trace);
  }

  trace.keydown({
    key: "ArrowLeft",
    code: "ArrowLeft",
    keyCode: 37,
    isComposing: false,
  });

  const pos = element.selectionStart ?? 0;
  if (pos > 0) {
    setInputValue(element, element.value, pos - 1);
  }

  trace.keyup({
    key: "ArrowLeft",
    code: "ArrowLeft",
    keyCode: 37,
    isComposing: false,
  });

  return trace.records;
}

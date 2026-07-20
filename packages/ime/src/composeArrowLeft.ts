import type { ComposedEventRecord } from "./composeHangulTypes";
import {
  confirmAndEndComposition,
  pushKeydown,
  pushKeyup,
  setInputValue,
} from "./composeHangulInternals";
import { getImeSession } from "./imeSession";

/**
 * ArrowLeft: if composing, confirm+end composition first (ibus-hangul style), then move caret.
 */
export async function composeArrowLeft(
  element: HTMLInputElement | HTMLTextAreaElement,
): Promise<ComposedEventRecord[]> {
  const records: ComposedEventRecord[] = [];
  const session = getImeSession(element);

  if (session?.composing) {
    confirmAndEndComposition(element, records);
  }

  pushKeydown(element, records, {
    key: "ArrowLeft",
    code: "ArrowLeft",
    keyCode: 37,
    isComposing: false,
  });

  const pos = element.selectionStart ?? 0;
  if (pos > 0) {
    setInputValue(element, element.value, pos - 1);
  }

  pushKeyup(element, records, {
    key: "ArrowLeft",
    code: "ArrowLeft",
    keyCode: 37,
    isComposing: false,
  });

  return records;
}

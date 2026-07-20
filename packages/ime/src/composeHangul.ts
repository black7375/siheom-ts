import { planHangulKeystrokes } from "./hangulPlan";
import type { ComposedEventRecord } from "./composeHangulTypes";
import { dispatch, playStroke, snapshot } from "./composeHangulInternals";
import { clearImeSession, setImeSession } from "./imeSession";

export type { ComposedEventRecord } from "./composeHangulTypes";
export {
  applyPreedit,
  dispatch,
  setInputValue,
  snapshot,
} from "./composeHangulInternals";

export type ComposeHangulOptions = {
  /** When true (default), fire compositionend for the final syllable */
  commitFinal?: boolean;
};

/**
 * Type Hangul `text` into an input by dispatching composition-faithful events.
 * Returns the serialized event records (same shape as the IME logger).
 */
export async function composeHangul(
  element: HTMLInputElement | HTMLTextAreaElement,
  text: string,
  options: ComposeHangulOptions = {},
): Promise<ComposedEventRecord[]> {
  const { commitFinal = true } = options;
  const selectionStart = element.selectionStart ?? element.value.length;
  const selectionEnd = element.selectionEnd ?? element.value.length;
  const prefix = element.value.slice(0, selectionStart);
  const suffix = element.value.slice(selectionEnd);
  const strokes = planHangulKeystrokes(text, { prefix });
  const records: ComposedEventRecord[] = [];

  element.focus();

  for (const stroke of strokes) {
    const carets = stroke.valuesAfterSteps.map((value) => value.length);
    stroke.valuesAfterSteps = stroke.valuesAfterSteps.map((value) => value + suffix);
    playStroke(element, stroke, records, carets);
  }

  if (strokes.length === 0) {
    return records;
  }

  const last = strokes[strokes.length - 1];
  const finalPreedit = last?.preeditSteps[last.preeditSteps.length - 1] ?? "";
  const committed = element.value.slice(0, element.value.length - suffix.length - finalPreedit.length);

  if (commitFinal) {
    dispatch(element, "compositionend", { bubbles: true, data: finalPreedit });
    records.push(
      snapshot(element, "compositionend", {
        data: finalPreedit,
        value: element.value,
      }),
    );
    clearImeSession(element);
  } else {
    setImeSession(element, {
      composing: true,
      committed,
      preedit: finalPreedit,
      suffix,
    });
  }

  return records;
}

/** Critical fields for golden-trace comparison (keyup order is flaky across captures). */
export function toCriticalEvents(events: ComposedEventRecord[]) {
  return events
    .filter((event) => event.type !== "keyup")
    .map((event) => ({
      type: event.type,
      key: event.key,
      code: event.code,
      keyCode: event.keyCode,
      isComposing: event.isComposing,
      inputType: event.inputType,
      data: event.data,
      value: event.value,
    }));
}

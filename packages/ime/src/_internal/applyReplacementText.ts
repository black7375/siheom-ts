import type { ComposedEventRecord } from "./types";
import { dispatch, setInputValue, snapshot } from "./events";

export type ReplacementInputType = "insertText" | "insertReplacementText";

export function replacementInputType(
  previousValue: string,
  nextValue: string,
  data: string,
): ReplacementInputType {
  if (nextValue === previousValue) {
    return "insertReplacementText";
  }
  if (
    nextValue.length > previousValue.length &&
    nextValue.startsWith(previousValue) &&
    nextValue.slice(previousValue.length) === data
  ) {
    return "insertText";
  }
  return "insertReplacementText";
}

/** Safari Apple IME: beforeinput → input without composition events. */
export function applyReplacementText(
  element: HTMLInputElement | HTMLTextAreaElement,
  data: string,
  value: string,
  records: ComposedEventRecord[],
  inputType: ReplacementInputType,
  caret: number = value.length,
) {
  dispatch(element, "beforeinput", {
    bubbles: true,
    cancelable: true,
    inputType,
    data,
    isComposing: false,
  });
  records.push(
    snapshot(element, "beforeinput", {
      inputType,
      data,
      isComposing: false,
      value: element.value,
    }),
  );

  setInputValue(element, value, caret);
  dispatch(element, "input", {
    bubbles: true,
    inputType,
    data,
    isComposing: false,
  });
  records.push(
    snapshot(element, "input", {
      inputType,
      data,
      isComposing: false,
      value,
    }),
  );
}

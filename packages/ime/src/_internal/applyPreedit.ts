import type { ComposedEventRecord } from "./types";
import { dispatch, setInputValue, snapshot } from "./events";
import { markPendingMaxLengthReject, readMaxLength } from "./maxLength";

/** Apply one composition preedit snapshot: compositionupdate → beforeinput → value → input. */
export function applyPreedit(
  element: HTMLInputElement | HTMLTextAreaElement,
  preedit: string,
  value: string,
  records: ComposedEventRecord[],
  caret: number = value.length,
) {
  const inputData = preedit === "" ? null : preedit;
  const valueBefore = element.value;

  dispatch(element, "compositionupdate", { bubbles: true, data: preedit, cancelable: true });
  records.push(snapshot(element, "compositionupdate", { data: preedit, value: valueBefore }));

  dispatch(element, "beforeinput", {
    bubbles: true,
    cancelable: true,
    inputType: "insertCompositionText",
    data: preedit,
    isComposing: true,
  });
  records.push(
    snapshot(element, "beforeinput", {
      inputType: "insertCompositionText",
      data: preedit,
      isComposing: true,
      value: valueBefore,
    }),
  );

  setInputValue(element, value, caret);
  dispatch(element, "input", {
    bubbles: true,
    inputType: "insertCompositionText",
    data: inputData,
    isComposing: true,
  });
  records.push(
    snapshot(element, "input", {
      inputType: "insertCompositionText",
      data: inputData,
      isComposing: true,
      value: element.value,
    }),
  );

  const limit = readMaxLength(element);
  if (limit !== null && value.length > limit) {
    markPendingMaxLengthReject(element, preedit, value);
  }
}

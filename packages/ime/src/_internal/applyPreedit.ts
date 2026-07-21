import { setInputValue } from "./events";
import type { ImeTrace } from "./imeTrace";
import { markPendingMaxLengthReject, readMaxLength } from "./maxLength";

/** Apply one composition preedit snapshot: compositionupdate → beforeinput → value → input. */
export function applyPreedit(
  trace: ImeTrace,
  preedit: string,
  value: string,
  caret: number = value.length,
) {
  const { element } = trace;
  const inputData = preedit === "" ? null : preedit;
  const valueBefore = element.value;

  trace.compositionUpdate(preedit, valueBefore);
  trace.beforeInput({
    inputType: "insertCompositionText",
    data: preedit,
    isComposing: true,
    value: valueBefore,
  });

  setInputValue(element, value, caret);
  trace.input({
    inputType: "insertCompositionText",
    data: inputData,
    isComposing: true,
  });

  const limit = readMaxLength(element);
  if (limit !== null && value.length > limit) {
    markPendingMaxLengthReject(element, preedit, value);
  }
}

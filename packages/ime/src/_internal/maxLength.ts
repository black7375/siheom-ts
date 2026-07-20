import type { ComposedEventRecord } from "./types";
import { dispatch, setInputValue, snapshot } from "./events";
import { clearImeSession, getImeSession, setImeSession } from "./session";

export function readMaxLength(element: HTMLInputElement | HTMLTextAreaElement): number | null {
  const limit = element.maxLength;
  return limit < 0 ? null : limit;
}

function clampValue(value: string, limit: number): string {
  return value.slice(0, limit);
}

/** Chrome / Linux composition: reject overflow with empty input data then compositionend. */
export function rejectChromeCompositionOverflow(
  element: HTMLInputElement | HTMLTextAreaElement,
  preedit: string,
  overflowValue: string,
  records: ComposedEventRecord[],
) {
  const limit = readMaxLength(element);
  if (limit === null) return;

  const clamped = clampValue(overflowValue, limit);

  dispatch(element, "compositionupdate", { bubbles: true, data: preedit, cancelable: true });
  records.push(snapshot(element, "compositionupdate", { data: preedit, value: overflowValue }));

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
      value: overflowValue,
    }),
  );

  setInputValue(element, clamped, clamped.length);
  dispatch(element, "input", {
    bubbles: true,
    inputType: "insertCompositionText",
    data: "",
    isComposing: true,
  });
  records.push(
    snapshot(element, "input", {
      inputType: "insertCompositionText",
      data: "",
      isComposing: true,
      value: clamped,
    }),
  );

  dispatch(element, "compositionend", { bubbles: true, data: preedit });
  records.push(snapshot(element, "compositionend", { data: preedit, value: clamped }));
  clearImeSession(element);
}

/** Safari composition: deleteCompositionText + insertFromComposition("") + compositionend. */
export function rejectSafariCompositionOverflow(
  element: HTMLInputElement | HTMLTextAreaElement,
  preedit: string,
  overflowValue: string,
  records: ComposedEventRecord[],
) {
  const limit = readMaxLength(element);
  if (limit === null) return;

  const clamped = clampValue(overflowValue, limit);

  dispatch(element, "compositionupdate", { bubbles: true, data: preedit, cancelable: true });
  records.push(snapshot(element, "compositionupdate", { data: preedit, value: overflowValue }));

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
      value: overflowValue,
    }),
  );

  dispatch(element, "input", {
    bubbles: true,
    inputType: "insertCompositionText",
    data: preedit,
    isComposing: true,
  });
  records.push(
    snapshot(element, "input", {
      inputType: "insertCompositionText",
      data: preedit,
      isComposing: true,
      value: overflowValue,
    }),
  );

  dispatch(element, "beforeinput", {
    bubbles: true,
    cancelable: true,
    inputType: "deleteCompositionText",
    data: null,
    isComposing: true,
  });
  records.push(
    snapshot(element, "beforeinput", {
      inputType: "deleteCompositionText",
      data: null,
      isComposing: true,
      value: overflowValue,
    }),
  );

  setInputValue(element, clamped, clamped.length);
  dispatch(element, "input", {
    bubbles: true,
    inputType: "deleteCompositionText",
    data: null,
    isComposing: true,
  });
  records.push(
    snapshot(element, "input", {
      inputType: "deleteCompositionText",
      data: null,
      isComposing: true,
      value: clamped,
    }),
  );

  dispatch(element, "beforeinput", {
    bubbles: true,
    cancelable: true,
    inputType: "insertFromComposition",
    data: "",
    isComposing: true,
  });
  records.push(
    snapshot(element, "beforeinput", {
      inputType: "insertFromComposition",
      data: "",
      isComposing: true,
      value: clamped,
    }),
  );

  dispatch(element, "input", {
    bubbles: true,
    inputType: "insertFromComposition",
    data: "",
    isComposing: true,
  });
  records.push(
    snapshot(element, "input", {
      inputType: "insertFromComposition",
      data: "",
      isComposing: true,
      value: clamped,
    }),
  );

  dispatch(element, "compositionend", { bubbles: true, data: preedit });
  records.push(snapshot(element, "compositionend", { data: preedit, value: clamped }));
  clearImeSession(element);
}

/** Safari replacement: reject overflow with empty insertText. */
export function rejectSafariReplacementOverflow(
  element: HTMLInputElement | HTMLTextAreaElement,
  records: ComposedEventRecord[],
) {
  const value = element.value;

  dispatch(element, "beforeinput", {
    bubbles: true,
    cancelable: true,
    inputType: "insertText",
    data: "",
    isComposing: false,
  });
  records.push(
    snapshot(element, "beforeinput", {
      inputType: "insertText",
      data: "",
      isComposing: false,
      value,
    }),
  );

  dispatch(element, "input", {
    bubbles: true,
    inputType: "insertText",
    data: "",
    isComposing: false,
  });
  records.push(
    snapshot(element, "input", {
      inputType: "insertText",
      data: "",
      isComposing: false,
      value,
    }),
  );
}

export function markPendingMaxLengthReject(
  element: HTMLInputElement | HTMLTextAreaElement,
  preedit: string,
  overflowValue: string,
) {
  const session = getImeSession(element);
  if (!session) return;
  setImeSession(element, {
    ...session,
    pendingMaxLengthReject: { preedit, overflowValue },
  });
}

export function takePendingMaxLengthReject(element: HTMLInputElement | HTMLTextAreaElement) {
  const session = getImeSession(element);
  if (!session?.pendingMaxLengthReject) return undefined;
  const pending = session.pendingMaxLengthReject;
  setImeSession(element, { ...session, pendingMaxLengthReject: undefined });
  return pending;
}

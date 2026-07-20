import type { HangulKeyStroke } from "./hangulPlan";
import type { ComposedEventRecord } from "./composeHangulTypes";
import { clearImeSession, getImeSession, setImeSession } from "./imeSession";

export type { ComposedEventRecord } from "./composeHangulTypes";

export function setInputValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
  caret: number = value.length,
) {
  element.value = value;
  element.setSelectionRange(caret, caret);
}

export function dispatch<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  init: EventInit & Record<string, unknown>,
) {
  let event: Event;
  if (type.startsWith("key")) {
    event = new KeyboardEvent(type, init as KeyboardEventInit);
  } else if (type.startsWith("composition")) {
    event = new CompositionEvent(type, init as CompositionEventInit);
  } else if (type === "beforeinput" || type === "input") {
    event = new InputEvent(type, init as InputEventInit);
  } else {
    event = new Event(type, init);
  }
  element.dispatchEvent(event);
}

export function snapshot(
  element: HTMLInputElement | HTMLTextAreaElement,
  type: string,
  partial: Partial<ComposedEventRecord>,
): ComposedEventRecord {
  return {
    type,
    key: partial.key ?? null,
    code: partial.code ?? null,
    keyCode: partial.keyCode ?? null,
    isComposing: partial.isComposing ?? null,
    inputType: partial.inputType ?? null,
    data: partial.data ?? null,
    value: partial.value ?? element.value,
  };
}

type KeyEventInit = {
  key: string;
  code: string;
  keyCode: number;
  isComposing: boolean;
  cancelable?: boolean;
};

export function pushKeydown(
  element: HTMLInputElement | HTMLTextAreaElement,
  records: ComposedEventRecord[],
  init: KeyEventInit,
) {
  dispatch(element, "keydown", {
    bubbles: true,
    cancelable: init.cancelable ?? true,
    key: init.key,
    code: init.code,
    keyCode: init.keyCode,
    isComposing: init.isComposing,
  });
  records.push(
    snapshot(element, "keydown", {
      key: init.key,
      code: init.code,
      keyCode: init.keyCode,
      isComposing: init.isComposing,
    }),
  );
}

export function pushKeyup(
  element: HTMLInputElement | HTMLTextAreaElement,
  records: ComposedEventRecord[],
  init: KeyEventInit,
) {
  dispatch(element, "keyup", {
    bubbles: true,
    key: init.key,
    code: init.code,
    keyCode: init.keyCode,
    isComposing: init.isComposing,
  });
  records.push(
    snapshot(element, "keyup", {
      key: init.key,
      code: init.code,
      keyCode: init.keyCode,
      isComposing: init.isComposing,
    }),
  );
}

export function pushCompositionStart(
  element: HTMLInputElement | HTMLTextAreaElement,
  records: ComposedEventRecord[],
) {
  dispatch(element, "compositionstart", { bubbles: true, data: "" });
  records.push(snapshot(element, "compositionstart", { data: "" }));
}

export function commitBetweenPreeditSteps(
  element: HTMLInputElement | HTMLTextAreaElement,
  stroke: HangulKeyStroke,
  value: string,
  records: ComposedEventRecord[],
  stepIndex: number,
) {
  if (stepIndex !== 0 || stroke.commitAfterFirstStep === undefined) return;

  dispatch(element, "compositionend", {
    bubbles: true,
    data: stroke.commitAfterFirstStep,
  });
  records.push(
    snapshot(element, "compositionend", {
      data: stroke.commitAfterFirstStep,
      value,
    }),
  );
  pushCompositionStart(element, records);
}

/** Confirm an active IME session with compositionend (Enter / ArrowLeft paths). */
export function confirmAndEndComposition(
  element: HTMLInputElement | HTMLTextAreaElement,
  records: ComposedEventRecord[],
) {
  const session = getImeSession(element);
  if (!session?.composing) return;

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

export function applyPreedit(
  element: HTMLInputElement | HTMLTextAreaElement,
  preedit: string,
  value: string,
  records: ComposedEventRecord[],
  caret: number = value.length,
) {
  const inputData = preedit === "" ? null : preedit;

  dispatch(element, "compositionupdate", { bubbles: true, data: preedit, cancelable: true });
  records.push(snapshot(element, "compositionupdate", { data: preedit }));

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
      value,
    }),
  );
}

export function playStroke(
  element: HTMLInputElement | HTMLTextAreaElement,
  stroke: HangulKeyStroke,
  records: ComposedEventRecord[],
  carets?: number[],
) {
  pushKeydown(element, records, {
    key: "Process",
    code: stroke.code,
    keyCode: 229,
    isComposing: stroke.keydownIsComposing,
  });

  if (stroke.compositionStart) {
    pushCompositionStart(element, records);
  }

  for (let i = 0; i < stroke.preeditSteps.length; i++) {
    const preedit = stroke.preeditSteps[i] ?? "";
    const value = stroke.valuesAfterSteps[i] ?? element.value;
    const caret = carets?.[i] ?? value.length;
    applyPreedit(element, preedit, value, records, caret);
    commitBetweenPreeditSteps(element, stroke, value, records, i);
  }

  pushKeyup(element, records, {
    key: stroke.key,
    code: stroke.code,
    keyCode: stroke.key.charCodeAt(0),
    isComposing: true,
  });
}

export function updateImeSessionForPreedit(
  element: HTMLInputElement | HTMLTextAreaElement,
  preedit: string,
  value: string,
  caret: number,
  suffix: string,
) {
  const committedLen = caret - preedit.length;
  setImeSession(element, {
    composing: true,
    committed: value.slice(0, committedLen),
    preedit,
    suffix,
  });
}

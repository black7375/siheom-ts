import type { HangulKeyStroke } from "./hangulPlan";
import type { ComposedEventRecord } from "./composeHangulTypes";

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
  dispatch(element, "keydown", {
    bubbles: true,
    cancelable: true,
    key: "Process",
    code: stroke.code,
    keyCode: 229,
    isComposing: stroke.keydownIsComposing,
  });
  records.push(
    snapshot(element, "keydown", {
      key: "Process",
      code: stroke.code,
      keyCode: 229,
      isComposing: stroke.keydownIsComposing,
    }),
  );

  if (stroke.compositionStart) {
    dispatch(element, "compositionstart", { bubbles: true, data: "" });
    records.push(snapshot(element, "compositionstart", { data: "" }));
  }

  for (let i = 0; i < stroke.preeditSteps.length; i++) {
    const preedit = stroke.preeditSteps[i] ?? "";
    const value = stroke.valuesAfterSteps[i] ?? element.value;
    const caret = carets?.[i] ?? value.length;
    applyPreedit(element, preedit, value, records, caret);

    if (i === 0 && stroke.commitAfterFirstStep !== undefined) {
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
      dispatch(element, "compositionstart", { bubbles: true, data: "" });
      records.push(snapshot(element, "compositionstart", { data: "" }));
    }
  }

  dispatch(element, "keyup", {
    bubbles: true,
    key: stroke.key,
    code: stroke.code,
    keyCode: stroke.key.charCodeAt(0),
    isComposing: true,
  });
  records.push(
    snapshot(element, "keyup", {
      key: stroke.key,
      code: stroke.code,
      keyCode: stroke.key.charCodeAt(0),
      isComposing: true,
    }),
  );
}

import type { ComposedEventRecord } from "./types";

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
    // Chromium's InputEvent constructor drops WebKit-only inputTypes
    // (deleteCompositionText, insertFromComposition) to "" — restore them.
    const inputType = (init as InputEventInit).inputType;
    if (inputType && (event as InputEvent).inputType !== inputType) {
      Object.defineProperty(event, "inputType", { value: inputType });
    }
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

export type KeyEventFields = {
  key: string;
  code: string;
  keyCode: number;
  isComposing: boolean;
  cancelable?: boolean;
};

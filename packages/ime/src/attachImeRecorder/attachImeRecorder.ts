import type { ComposedEventRecord } from "../_internal";

const IME_EVENT_TYPES = [
  "keydown",
  "keyup",
  "keypress",
  "compositionstart",
  "compositionupdate",
  "compositionend",
  "beforeinput",
  "input",
] as const;

function snapshotFromDom(
  element: HTMLInputElement | HTMLTextAreaElement,
  event: Event,
): ComposedEventRecord {
  const keyboard = event as KeyboardEvent;
  const composition = event as CompositionEvent;
  const input = event as InputEvent;

  return {
    type: event.type,
    key: "key" in keyboard ? (keyboard.key ?? null) : null,
    code: "code" in keyboard ? (keyboard.code ?? null) : null,
    keyCode: "keyCode" in keyboard ? (keyboard.keyCode ?? null) : null,
    isComposing:
      "isComposing" in keyboard || "isComposing" in input
        ? ((keyboard as KeyboardEvent).isComposing ?? (input as InputEvent).isComposing ?? null)
        : null,
    inputType: "inputType" in input ? (input.inputType ?? null) : null,
    data:
      event.type.startsWith("composition") || event.type === "beforeinput" || event.type === "input"
        ? ((composition.data ?? input.data ?? null) as string | null)
        : null,
    value: element.value,
  };
}

/** Attach listeners that record IME-relevant DOM events (logger-compatible shape). */
export function attachImeRecorder(element: HTMLInputElement | HTMLTextAreaElement): {
  events: ComposedEventRecord[];
  detach: () => void;
} {
  const events: ComposedEventRecord[] = [];
  const listener = (event: Event) => {
    events.push(snapshotFromDom(element, event));
  };

  for (const type of IME_EVENT_TYPES) {
    element.addEventListener(type, listener);
  }

  return {
    events,
    detach: () => {
      for (const type of IME_EVENT_TYPES) {
        element.removeEventListener(type, listener);
      }
    },
  };
}

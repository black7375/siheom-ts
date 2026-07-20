import { serializeImeEvent, type ImeEventRecord } from "./serializeImeEvent";

export const LOGGED_EVENT_TYPES = [
  "keydown",
  "keyup",
  "keypress",
  "compositionstart",
  "compositionupdate",
  "compositionend",
  "beforeinput",
  "input",
] as const;

export function readEditableValue(target: EventTarget | null): string {
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    return target.value;
  }
  return "";
}

/** Attach serializers, run `run`, return captured records (for OS IME UI or user-event fixtures). */
export async function recordInputEvents(
  element: HTMLElement,
  run: () => Promise<void>,
): Promise<ImeEventRecord[]> {
  const events: ImeEventRecord[] = [];
  const handler = (event: Event) => {
    events.push(serializeImeEvent(event, readEditableValue(event.target)));
  };

  for (const type of LOGGED_EVENT_TYPES) {
    element.addEventListener(type, handler);
  }

  try {
    await run();
  } finally {
    for (const type of LOGGED_EVENT_TYPES) {
      element.removeEventListener(type, handler);
    }
  }

  return events;
}

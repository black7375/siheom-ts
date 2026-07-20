import type { HangulKeyStroke } from "./hangulPlan";
import { planHangulKeystrokes } from "./hangulPlan";

export type ComposedEventRecord = {
  type: string;
  key: string | null;
  code: string | null;
  keyCode: number | null;
  isComposing: boolean | null;
  inputType: string | null;
  data: string | null;
  value: string;
};

function setInputValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  element.value = value;
  // Keep caret at end — Hangul IME default for simple typing
  const end = value.length;
  element.setSelectionRange(end, end);
}

function dispatch<K extends keyof HTMLElementEventMap>(
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

function applyPreedit(
  element: HTMLInputElement | HTMLTextAreaElement,
  preedit: string,
  value: string,
  records: ComposedEventRecord[],
) {
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

  setInputValue(element, value);
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
      value,
    }),
  );
}

function snapshot(
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

function playStroke(
  element: HTMLInputElement | HTMLTextAreaElement,
  stroke: HangulKeyStroke,
  records: ComposedEventRecord[],
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
    applyPreedit(element, preedit, value, records);

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
  const strokes = planHangulKeystrokes(text);
  const records: ComposedEventRecord[] = [];

  element.focus();

  for (const stroke of strokes) {
    playStroke(element, stroke, records);
  }

  if (commitFinal && strokes.length > 0) {
    const last = strokes[strokes.length - 1];
    const finalPreedit = last?.preeditSteps[last.preeditSteps.length - 1] ?? "";
    dispatch(element, "compositionend", { bubbles: true, data: finalPreedit });
    records.push(
      snapshot(element, "compositionend", {
        data: finalPreedit,
        value: element.value,
      }),
    );
  }

  return records;
}

/** Critical fields for golden-trace comparison (ignore flaky keyup.key). */
export function toCriticalEvents(events: ComposedEventRecord[]) {
  return events.map((event) => {
    if (event.type === "keyup") {
      return {
        type: event.type,
        code: event.code,
        isComposing: event.isComposing,
        value: event.value,
      };
    }
    return {
      type: event.type,
      key: event.key,
      code: event.code,
      keyCode: event.keyCode,
      isComposing: event.isComposing,
      inputType: event.inputType,
      data: event.data,
      value: event.value,
    };
  });
}

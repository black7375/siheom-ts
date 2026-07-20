export type ImeEventRecord = {
  type: string;
  key: string | null;
  code: string | null;
  keyCode: number | null;
  isComposing: boolean | null;
  inputType: string | null;
  data: string | null;
  value: string;
};

export type ImeTraceSource = "os-ime" | "user-event" | "cdp";

export type ImeTraceMeta = {
  os: string;
  browser: string;
  ime: string;
  capturedAt: string;
  scenarioId: string;
  source: ImeTraceSource;
};

export type ImeTrace = ImeTraceMeta & {
  profileId: string;
  events: ImeEventRecord[];
};

export function profileIdFromMeta(os: string, browser: string, ime: string): string {
  const parts = [os, browser, ime].map((part) => part.trim()).filter(Boolean);
  return parts.join("-");
}

export function serializeImeEvent(event: Event, value: string): ImeEventRecord {
  const keyboard = event as KeyboardEvent;
  const input = event as InputEvent;
  const composition = event as CompositionEvent;

  const isKeyboard = "key" in event && typeof keyboard.key === "string";
  const isInputLike =
    event.type === "beforeinput" || event.type === "input" || event.type.startsWith("composition");

  return {
    type: event.type,
    key: isKeyboard ? keyboard.key : null,
    code: isKeyboard && "code" in keyboard ? keyboard.code : null,
    keyCode: isKeyboard && "keyCode" in keyboard ? keyboard.keyCode : null,
    isComposing: "isComposing" in event ? Boolean(keyboard.isComposing) : null,
    inputType: isInputLike && "inputType" in input ? (input.inputType ?? null) : null,
    data: isInputLike
      ? "data" in input
        ? (input.data ?? composition.data ?? null)
        : (composition.data ?? null)
      : null,
    value,
  };
}

export function buildImeTrace({
  os,
  browser,
  ime,
  events,
  capturedAt,
  scenarioId,
  source,
}: ImeTraceMeta & { events: ImeEventRecord[] }): ImeTrace {
  return {
    profileId: profileIdFromMeta(os, browser, ime),
    os,
    browser,
    ime,
    capturedAt,
    scenarioId,
    source,
    events,
  };
}

export function formatImeTraceJson(trace: ImeTrace): string {
  return `${JSON.stringify(trace, null, 2)}\n`;
}

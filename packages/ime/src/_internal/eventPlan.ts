import type { KeyEventFields } from "./events";
import { setInputValue } from "./events";
import type { InputEventFields, ImeTrace } from "./imeTrace";
import { clearImeSession, getImeSession, setImeSession, type ImeComposeSession } from "./session";

export type EventPlanStep =
  | { kind: "keydown"; fields: KeyEventFields }
  | { kind: "keyup"; fields: KeyEventFields }
  | { kind: "compositionstart"; data?: string; value?: string }
  | { kind: "compositionupdate"; data: string; value?: string }
  | { kind: "compositionend"; data: string; value?: string }
  | { kind: "beforeinput"; fields: InputEventFields }
  | { kind: "input"; fields: InputEventFields }
  | { kind: "setValue"; value: string; caret: number }
  | { kind: "setSession"; session: ImeComposeSession }
  | { kind: "clearSession" }
  | { kind: "markPendingMaxLengthReject"; preedit: string; overflowValue: string };

/** Execute a pure event plan against the imperative ImeTrace shell. */
export function playEventPlan(trace: ImeTrace, steps: EventPlanStep[]): void {
  const { element } = trace;

  for (const step of steps) {
    switch (step.kind) {
      case "keydown":
        trace.keydown(step.fields);
        break;
      case "keyup":
        trace.keyup(step.fields);
        break;
      case "compositionstart":
        trace.compositionStart(step.data ?? "", step.value);
        break;
      case "compositionupdate":
        trace.compositionUpdate(step.data, step.value);
        break;
      case "compositionend":
        trace.compositionEnd(step.data, step.value);
        break;
      case "beforeinput":
        trace.beforeInput(step.fields);
        break;
      case "input":
        trace.input(step.fields);
        break;
      case "setValue":
        setInputValue(element, step.value, step.caret);
        break;
      case "setSession":
        setImeSession(element, step.session);
        break;
      case "clearSession":
        clearImeSession(element);
        break;
      case "markPendingMaxLengthReject": {
        const session = getImeSession(element);
        if (!session) break;
        setImeSession(element, {
          ...session,
          pendingMaxLengthReject: {
            preedit: step.preedit,
            overflowValue: step.overflowValue,
          },
        });
        break;
      }
    }
  }
}

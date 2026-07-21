import type { KeyEventFields } from "./events";
import { setInputValue } from "./events";
import type { InputEventFields, ImeTraceEmitter } from "./imeTrace";
import { ImeTrace } from "./imeTrace";
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

/** Execute a pure event plan against an IME trace shell. */
export function playEventPlan(trace: ImeTraceEmitter, steps: EventPlanStep[]): void {
  const inputElement = trace instanceof ImeTrace ? trace.element : null;

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
        if (inputElement) {
          setInputValue(inputElement, step.value, step.caret);
        }
        break;
      case "setSession":
        if (inputElement) {
          setImeSession(inputElement, step.session);
        }
        break;
      case "clearSession":
        if (inputElement) {
          clearImeSession(inputElement);
        }
        break;
      case "markPendingMaxLengthReject": {
        if (!inputElement) break;
        const session = getImeSession(inputElement);
        if (!session) break;
        setImeSession(inputElement, {
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

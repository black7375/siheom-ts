import { assemble } from "es-hangul";

import { hangulJamos } from "../hangulJamos";
import type { EventPlanStep } from "../_internal/eventPlan";
import type { ImeComposeSession } from "../_internal/session";
import { planPreedit } from "../_internal/planPreedit";

export function shrinkPreedit(preedit: string): string {
  const jamos = hangulJamos(preedit);
  if (jamos.length <= 1) return "";
  return assemble(jamos.slice(0, -1));
}

export type PlanBackspaceInput = {
  composing: boolean;
  session?: ImeComposeSession;
  value: string;
  selectionStart: number;
  selectionEnd: number;
  valueBefore: string;
  maxLength: number | null;
};

/** Pure: Backspace while composing (decompose) or deleteContentBackward. */
export function planBackspace(input: PlanBackspaceInput): EventPlanStep[] {
  if (input.composing && input.session) {
    const session = input.session;
    const nextPreedit = shrinkPreedit(session.preedit);
    const caret = session.committed.length + nextPreedit.length;
    const value = session.committed + nextPreedit + session.suffix;

    const steps: EventPlanStep[] = [
      {
        kind: "keydown",
        fields: {
          key: "Process",
          code: "Backspace",
          keyCode: 229,
          isComposing: true,
        },
      },
      ...planPreedit(nextPreedit, value, caret, {
        valueBefore: input.valueBefore,
        maxLength: input.maxLength,
      }),
    ];

    if (nextPreedit === "") {
      steps.push(
        { kind: "compositionend", data: "", value },
        { kind: "clearSession" },
        { kind: "setValue", value, caret },
        {
          kind: "keyup",
          fields: {
            key: "Backspace",
            code: "Backspace",
            keyCode: 8,
            isComposing: false,
          },
        },
      );
      return steps;
    }

    steps.push(
      {
        kind: "setSession",
        session: { ...session, preedit: nextPreedit },
      },
      {
        kind: "keyup",
        fields: {
          key: "Backspace",
          code: "Backspace",
          keyCode: 8,
          isComposing: true,
        },
      },
    );
    return steps;
  }

  const { value, selectionStart: start, selectionEnd: end } = input;
  let nextValue = value;
  let nextCaret = start;
  if (start === end && start > 0) {
    nextValue = value.slice(0, start - 1) + value.slice(end);
    nextCaret = start - 1;
  } else if (start !== end) {
    nextValue = value.slice(0, start) + value.slice(end);
    nextCaret = start;
  }

  return [
    {
      kind: "keydown",
      fields: {
        key: "Backspace",
        code: "Backspace",
        keyCode: 8,
        isComposing: false,
      },
    },
    {
      kind: "beforeinput",
      fields: {
        inputType: "deleteContentBackward",
        data: null,
        isComposing: false,
      },
    },
    { kind: "setValue", value: nextValue, caret: nextCaret },
    {
      kind: "input",
      fields: {
        inputType: "deleteContentBackward",
        data: null,
        isComposing: false,
        value: nextValue,
      },
    },
    {
      kind: "keyup",
      fields: {
        key: "Backspace",
        code: "Backspace",
        keyCode: 8,
        isComposing: false,
      },
    },
  ];
}

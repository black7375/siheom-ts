import { assemble, disassembleCompleteCharacter, combineVowels } from "es-hangul";

import { hangulJamos } from "../hangulJamos";
import type { EventPlanStep } from "../_internal/eventPlan";
import { planPostCompositionEndInput, planPreedit } from "../_internal/planPreedit";
import type { ImeComposeSession } from "../_internal/session";
import type { HangulKeyboardLayout } from "../profiles";

function normalizeJungseong(raw: string): string {
  if (raw.length <= 1) return raw;
  const chars = [...raw];
  let combined = chars[0] ?? "";
  for (let i = 1; i < chars.length; i++) {
    const next = chars[i];
    if (!next) continue;
    try {
      combined = combineVowels(combined, next) ?? combined + next;
    } catch {
      combined += next;
    }
  }
  return combined;
}

/** 2-set: remove one disassembled jamo. 세벌식: remove one role unit (ㅢ as one key). */
export function shrinkPreedit(
  preedit: string,
  hangulKeyboard: HangulKeyboardLayout = "dubeolsik",
): string {
  if (!preedit) return "";

  if (hangulKeyboard === "sebeolsik-ngs") {
    const chars = [...preedit];
    const last = chars[chars.length - 1];
    if (!last) return "";
    const parts = disassembleCompleteCharacter(last);
    if (!parts?.choseong) {
      const jamos = hangulJamos(preedit);
      if (jamos.length <= 1) return "";
      return assemble(jamos.slice(0, -1));
    }
    const prefix = chars.slice(0, -1).join("");
    if (parts.jongseong) {
      const jung = normalizeJungseong(parts.jungseong);
      return prefix + assemble([parts.choseong, jung]);
    }
    if (parts.jungseong) {
      return prefix + parts.choseong;
    }
    return prefix;
  }

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
  hangulKeyboard?: HangulKeyboardLayout;
  postCompositionEndInput?: boolean;
};

/** Pure: Backspace while composing (decompose) or deleteContentBackward. */
export function planBackspace(input: PlanBackspaceInput): EventPlanStep[] {
  if (input.composing && input.session) {
    const session = input.session;
    const nextPreedit = shrinkPreedit(session.preedit, input.hangulKeyboard ?? "dubeolsik");
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
      ...planPreedit(
        nextPreedit,
        value,
        caret,
        {
          valueBefore: input.valueBefore,
          maxLength: input.maxLength,
        },
        {
          emptyCompositionData: input.postCompositionEndInput ? "" : null,
        },
      ),
    ];

    if (nextPreedit === "") {
      steps.push(
        { kind: "compositionend", data: "", value },
        ...(input.postCompositionEndInput ? planPostCompositionEndInput("") : []),
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

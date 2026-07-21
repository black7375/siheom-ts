import { disassemble } from "es-hangul";

import { planHangulKeystrokes } from "../planHangulKeystrokes";
import type { ComposedEventRecord } from "../_internal";
import { ContentEditableImeTrace } from "../_internal/contentEditableImeTrace";
import { playEventPlan, type EventPlanStep } from "../_internal/eventPlan";
import { ImeTrace } from "../_internal/imeTrace";
import { isEditable } from "../withPresentElement";
import { planPreedit } from "../_internal/planPreedit";

/** Lexical Firefox COMPOSITION_START_CHAR (NBSP) + trailing ZWSP in contenteditable captures. */
const LEXICAL_FF_SENTINEL = "\u00a0\u200b";
const ZWSP = "\u200b";

function withZwsp(text: string): string {
  return `${text}${ZWSP}`;
}

function planDuplicateCompositionPulse(preedit: string, valueBefore: string): EventPlanStep[] {
  return [
    {
      kind: "beforeinput",
      fields: {
        inputType: "insertCompositionText",
        data: preedit,
        isComposing: true,
        value: valueBefore,
      },
    },
    {
      kind: "input",
      fields: {
        inputType: "insertCompositionText",
        data: preedit,
        isComposing: true,
      },
    },
  ];
}

function planFirefoxDeferredEnd(preedit: string): EventPlanStep[] {
  const visible = withZwsp(preedit);
  return [
    { kind: "compositionend", data: preedit, value: visible },
    {
      kind: "input",
      fields: {
        inputType: "insertCompositionText",
        data: preedit,
        isComposing: false,
      },
    },
  ];
}

function planLexicalPreeditPulse(
  preedit: string,
  valueBefore: string,
  domValue: string,
  applyDom: boolean,
): EventPlanStep[] {
  if (applyDom) {
    return planPreedit(preedit, domValue, preedit.length, {
      valueBefore,
      maxLength: null,
    });
  }

  const inputData = preedit === "" ? null : preedit;
  return [
    { kind: "compositionupdate", data: preedit, value: valueBefore },
    {
      kind: "beforeinput",
      fields: {
        inputType: "insertCompositionText",
        data: preedit,
        isComposing: true,
        value: valueBefore,
      },
    },
    {
      kind: "input",
      fields: {
        inputType: "insertCompositionText",
        data: inputData,
        isComposing: true,
        value: domValue,
      },
    },
  ];
}

/** Plan full preedit snapshots for Lexical AF broken mode (first syllable stays jamo). */
export function planLexicalBrokenPreeditSequence(text: string): string[] {
  const chars = [...text.replace(/\s/g, "")];
  if (chars.length === 0) return [];

  const firstSyllable = chars[0]!;
  const rest = chars.slice(1).join("");
  const jamoPrefix = disassemble(firstSyllable);
  const firstJamos = jamoPrefix.split("").filter((jamo) => jamo.trim().length > 0);

  const sequence: string[] = [firstJamos[0]!];

  let preedit = firstJamos[0]!;
  for (let index = 1; index < firstJamos.length; index++) {
    preedit += firstJamos[index];
    sequence.push(preedit);
  }

  if (!rest) return sequence;

  const strokes = planHangulKeystrokes(rest, { prefix: preedit });
  for (const stroke of strokes) {
    for (let stepIndex = 0; stepIndex < stroke.preeditSteps.length; stepIndex++) {
      if (stepIndex === 0 && stroke.commitAfterFirstStep !== undefined) {
        continue;
      }
      sequence.push(stroke.valuesAfterSteps[stepIndex]!);
    }
  }

  return sequence;
}

function playLexicalBrokenSequence(
  trace: ImeTrace | ContentEditableImeTrace,
  text: string,
  commitFinal: boolean,
): ComposedEventRecord[] {
  const preeditSequence = planLexicalBrokenPreeditSequence(text);
  const applyDom = trace instanceof ImeTrace;

  if (preeditSequence.length === 0) {
    return trace.records;
  }

  for (let index = 0; index < preeditSequence.length; index++) {
    const preedit = preeditSequence[index]!;
    const isFirst = index === 0;
    const isRestart = index === 1;
    const keydownComposing = !isFirst && !isRestart;
    const previous = index === 0 ? "" : preeditSequence[index - 1]!;

    const head: EventPlanStep[] = [
      {
        kind: "keydown",
        fields: {
          key: "Process",
          code: "",
          keyCode: 229,
          isComposing: keydownComposing,
        },
      },
    ];

    if (isFirst) {
      head.push({ kind: "compositionstart" });
    } else if (isRestart) {
      head.push({
        kind: "compositionstart",
        data: previous,
        value: previous,
      });
    }

    playEventPlan(trace, head);

    const valueBefore = isFirst || isRestart ? LEXICAL_FF_SENTINEL : withZwsp(previous);
    const domValue = withZwsp(preedit);

    playEventPlan(trace, planLexicalPreeditPulse(preedit, valueBefore, domValue, applyDom));
    playEventPlan(trace, [
      {
        kind: "keyup",
        fields: {
          key: "Process",
          code: "",
          keyCode: 229,
          isComposing: true,
        },
      },
    ]);

    if (isFirst) {
      const tail: EventPlanStep[] = [
        ...planDuplicateCompositionPulse(preedit, domValue),
        ...planFirefoxDeferredEnd(preedit),
      ];
      if (applyDom) {
        tail.push({ kind: "setValue", value: preedit, caret: preedit.length });
      }
      tail.push({ kind: "clearSession" });
      playEventPlan(trace, tail);
    }
  }

  if (commitFinal) {
    const finalPreedit = preeditSequence[preeditSequence.length - 1]!;
    const domValue = withZwsp(finalPreedit);
    playEventPlan(trace, [
      ...planDuplicateCompositionPulse(finalPreedit, domValue),
      ...planFirefoxDeferredEnd(finalPreedit),
      { kind: "clearSession" },
    ]);
  }

  return trace.records;
}

/**
 * Emulate Lexical #6377 on Android Firefox: after the first jamo, composition ends
 * prematurely and the first syllable stays jamo while later syllables compose normally.
 */
export async function composeHangulLexicalAndroidFirefox(
  element: HTMLInputElement | HTMLTextAreaElement,
  text: string,
  options: { commitFinal?: boolean } = {},
): Promise<ComposedEventRecord[]> {
  const { commitFinal = true } = options;
  element.focus();
  return playLexicalBrokenSequence(new ImeTrace(element), text, commitFinal);
}

/** Same AF Lexical sequence for contenteditable (events only — host editor owns DOM). */
export async function composeHangulLexicalAndroidFirefoxContentEditable(
  element: HTMLElement,
  text: string,
  options: { commitFinal?: boolean } = {},
): Promise<ComposedEventRecord[]> {
  const { commitFinal = true } = options;
  element.focus();
  return playLexicalBrokenSequence(new ContentEditableImeTrace(element), text, commitFinal);
}

export function composeHangulLexicalAndroidFirefoxOn(
  element: HTMLElement,
  text: string,
  options: { commitFinal?: boolean } = {},
): Promise<ComposedEventRecord[]> {
  if (isEditable(element)) {
    return composeHangulLexicalAndroidFirefox(element, text, options);
  }
  return composeHangulLexicalAndroidFirefoxContentEditable(element, text, options);
}

import { planHangulKeystrokes } from "../planHangulKeystrokes";
import type { ComposedEventRecord } from "../_internal";
import { ContentEditableImeTrace } from "../_internal/contentEditableImeTrace";
import { playEventPlan, type EventPlanStep } from "../_internal/eventPlan";
import { ImeTrace } from "../_internal/imeTrace";
import { isEditable } from "../withPresentElement";
import { planPreedit } from "../_internal/planPreedit";
import type { ImeProfile } from "../profiles";
import {
  contentEditableValueBefore,
  planContentEditableBoundaryCommit,
  planContentEditableBoundaryKeydown,
  planDuplicateCompositionPulse,
  planFirefoxDeferredEnd,
  stripZwsp,
  withZwsp,
} from "./contentEditableFirefoxShared";
import { planChromeStrokeHead, planChromeStrokeKeyup } from "./planStroke";
import { settleAfterPreedit } from "./settle";

function planContentEditablePreeditPulse(
  preedit: string,
  valueBefore: string,
  domValue: string,
  applyDom: boolean,
): EventPlanStep[] {
  if (applyDom) {
    return planPreedit(preedit, domValue, domValue.length, {
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

async function playContentEditableFixedSequence(
  trace: ImeTrace | ContentEditableImeTrace,
  text: string,
  commitFinal: boolean,
  profile: ImeProfile,
): Promise<ComposedEventRecord[]> {
  const strokes = planHangulKeystrokes(text);
  const applyDom = trace instanceof ImeTrace;
  const settleHost = trace instanceof ContentEditableImeTrace;
  let sessionJustStarted = true;
  let previousVisible = "";

  for (const stroke of strokes) {
    playEventPlan(trace, planChromeStrokeHead(stroke, profile));

    for (let stepIndex = 0; stepIndex < stroke.preeditSteps.length; stepIndex++) {
      if (stepIndex === 0 && stroke.commitAfterFirstStep !== undefined) {
        playEventPlan(trace, [planContentEditableBoundaryKeydown(withZwsp(previousVisible))]);
      }

      const preedit = stroke.preeditSteps[stepIndex]!;
      const value = stroke.valuesAfterSteps[stepIndex]!;
      const valueBefore = contentEditableValueBefore(previousVisible, sessionJustStarted);
      const domValue = withZwsp(value);

      playEventPlan(
        trace,
        planContentEditablePreeditPulse(preedit, valueBefore, domValue, applyDom),
      );

      if (stepIndex === 0 && stroke.commitAfterFirstStep !== undefined) {
        playEventPlan(trace, planContentEditableBoundaryCommit(stroke.commitAfterFirstStep, value));
        previousVisible = stripZwsp(value);
        sessionJustStarted = true;
      } else {
        previousVisible = stripZwsp(value);
        sessionJustStarted = false;
      }

      if (settleHost) {
        await settleAfterPreedit("macrotask");
      }
    }

    playEventPlan(trace, planChromeStrokeKeyup(stroke, profile));
    if (settleHost) {
      await settleAfterPreedit("macrotask");
    }
  }

  if (commitFinal && strokes.length > 0) {
    const lastStroke = strokes[strokes.length - 1]!;
    const finalPreedit = lastStroke.preeditSteps[lastStroke.preeditSteps.length - 1] ?? text;
    const finalDomValue =
      lastStroke.valuesAfterSteps[lastStroke.valuesAfterSteps.length - 1] ?? text;
    playEventPlan(trace, [
      ...planDuplicateCompositionPulse(finalPreedit, withZwsp(finalDomValue)),
      ...planFirefoxDeferredEnd(finalPreedit, finalDomValue),
      { kind: "clearSession" },
    ]);
    if (settleHost) {
      await settleAfterPreedit("macrotask");
    }
  }

  return trace.records;
}

/** Fixed Firefox contenteditable path: syllable commits with deferred compositionend. */
export async function composeHangulContentEditableFirefoxFixed(
  element: HTMLInputElement | HTMLTextAreaElement,
  text: string,
  options: { commitFinal?: boolean; profile?: ImeProfile } = {},
): Promise<ComposedEventRecord[]> {
  const { commitFinal = true, profile } = options;
  element.focus();
  return playContentEditableFixedSequence(
    new ImeTrace(element),
    text,
    commitFinal,
    profile ?? {
      id: "linux-firefox-contenteditable-fixed",
      enterDuringComposition: "webkit",
      hangulKeyEventKey: "process",
      hangulComposeMode: "contenteditable-firefox-fixed",
      hanjaConversion: "replace",
      hangulCompositionBoundary: "syllable",
    },
  );
}

export async function composeHangulContentEditableFirefoxFixedOnContentEditable(
  element: HTMLElement,
  text: string,
  options: { commitFinal?: boolean; profile?: ImeProfile } = {},
): Promise<ComposedEventRecord[]> {
  const { commitFinal = true, profile } = options;
  element.focus();
  return playContentEditableFixedSequence(
    new ContentEditableImeTrace(element),
    text,
    commitFinal,
    profile ?? {
      id: "linux-firefox-contenteditable-fixed",
      enterDuringComposition: "webkit",
      hangulKeyEventKey: "process",
      hangulComposeMode: "contenteditable-firefox-fixed",
      hanjaConversion: "replace",
      hangulCompositionBoundary: "syllable",
    },
  );
}

export function composeHangulContentEditableFirefoxFixedOn(
  element: HTMLElement,
  text: string,
  options: { commitFinal?: boolean; profile?: ImeProfile } = {},
): Promise<ComposedEventRecord[]> {
  if (isEditable(element)) {
    return composeHangulContentEditableFirefoxFixed(element, text, options);
  }
  return composeHangulContentEditableFirefoxFixedOnContentEditable(element, text, options);
}

import type { HangulKeyStroke } from "../planHangulKeystrokes";
import {
  applyPreedit,
  applyReplacementText,
  clearImeSession,
  commitSafariSyllable,
  commitSafariSyllableCore,
  hangulKeydownFields,
  hangulKeyupFields,
  ImeTrace,
  readMaxLength,
  rejectSafariCompositionOverflow,
  rejectSafariReplacementOverflow,
  replacementInputType,
  restartSafariComposition,
  updateImeSessionForPreedit,
  type ComposedEventRecord,
} from "../_internal";
import { consumeImeControlledWriteback } from "../markImeControlledWriteback";
import type { ImeProfile } from "../profiles";

import type { ComposeHangulOptions } from "./composeHangul";

function shouldConfirmAfterStroke(strokes: HangulKeyStroke[], index: number): boolean {
  const next = strokes[index + 1];
  if (!next) return true;
  return next.compositionStart;
}

async function settleAfterPreedit(settle: "microtask" | "macrotask") {
  if (settle === "microtask") {
    await Promise.resolve();
    await Promise.resolve();
    return;
  }
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

function confirmSyllable(trace: ImeTrace, syllable: string) {
  applyReplacementText(trace, syllable, trace.element.value, "insertReplacementText");
}

/** macOS Safari Apple: insertText / insertReplacementText + jamo keydown (no composition). */
export async function composeHangulSafariReplacement(
  element: HTMLInputElement | HTMLTextAreaElement,
  strokes: HangulKeyStroke[],
  suffix: string,
  profile: ImeProfile,
  options: Pick<ComposeHangulOptions, "settle">,
): Promise<ComposedEventRecord[]> {
  const { settle = "microtask" } = options;
  const trace = new ImeTrace(element);

  for (let strokeIndex = 0; strokeIndex < strokes.length; strokeIndex++) {
    const stroke = strokes[strokeIndex];
    if (!stroke) continue;

    const finalPreedit = stroke.preeditSteps[stroke.preeditSteps.length - 1] ?? "";

    for (let i = 0; i < stroke.preeditSteps.length; i++) {
      const preedit = stroke.preeditSteps[i] ?? "";
      const value = stroke.valuesAfterSteps[i] ?? element.value;
      const caret = value.length - suffix.length;
      const previousValue = element.value;

      applyReplacementText(
        trace,
        preedit,
        value,
        replacementInputType(previousValue, value, preedit),
        caret,
      );

      trace.keydown({
        ...hangulKeydownFields(profile, stroke),
        isComposing: false,
      });
      trace.keyup({
        ...hangulKeyupFields(profile, stroke, false),
      });

      await settleAfterPreedit(settle ?? "microtask");
    }

    if (shouldConfirmAfterStroke(strokes, strokeIndex) && finalPreedit) {
      confirmSyllable(trace, finalPreedit);
    }
  }

  return trace.records;
}

/** macOS Safari Apple composition order: update → input → keydown (fixed delayed-update captures). */
async function playStrokeSafariComposition(
  trace: ImeTrace,
  stroke: HangulKeyStroke,
  suffix: string,
  profile: ImeProfile,
  settle: "microtask" | "macrotask",
  deferredUpdateRace: boolean,
): Promise<
  { status: "aborted-deferred"; step: number } | { status: "maxlength-reject" } | { status: "ok" }
> {
  const { element } = trace;
  const carets = stroke.valuesAfterSteps.map((value) => value.length - suffix.length);
  const limit = readMaxLength(element);

  if (stroke.compositionStart) {
    trace.compositionStart();
  }

  for (let i = 0; i < stroke.preeditSteps.length; i++) {
    const preedit = stroke.preeditSteps[i] ?? "";
    const value = stroke.valuesAfterSteps[i] ?? element.value;
    const caret = carets[i] ?? value.length - suffix.length;

    updateImeSessionForPreedit(element, preedit, value, caret, suffix);
    applyPreedit(trace, preedit, value, caret);

    if (limit !== null && value.length > limit) {
      // Overflow keystroke: Safari fires the keydown, then either the host
      // clamped the DOM (fixed UI) or the overflow stays until reject (broken).
      const clamped = value.slice(0, limit);
      const hostClamped = element.value === clamped;

      trace.keydown({
        ...hangulKeydownFields(profile, stroke),
        isComposing: !hostClamped,
      });
      trace.keyup({
        ...hangulKeyupFields(profile, stroke, !hostClamped),
      });

      if (hostClamped) {
        // Composition died with the clamp: restart, echo the preedit, then empty insertText.
        trace.compositionStart();
        applyPreedit(trace, preedit, clamped, clamped.length);
        rejectSafariReplacementOverflow(trace);
      } else {
        rejectSafariCompositionOverflow(trace, preedit, value);
      }
      clearImeSession(element);
      return { status: "maxlength-reject" };
    }

    if (i === 0 && stroke.commitAfterFirstStep !== undefined) {
      commitSafariSyllableCore(trace, stroke.commitAfterFirstStep, element.value);
      trace.compositionStart();
    }
  }

  trace.keydown({
    ...hangulKeydownFields(profile, stroke),
    isComposing: true,
  });
  trace.keyup({
    ...hangulKeyupFields(profile, stroke, true),
  });

  await settleAfterPreedit(settle);
  if (deferredUpdateRace) {
    await settleAfterPreedit(settle);
  }

  const lastValue = stroke.valuesAfterSteps[stroke.valuesAfterSteps.length - 1] ?? element.value;
  const writeback = deferredUpdateRace && consumeImeControlledWriteback(element);
  const clobbered = element.value !== lastValue;

  if (writeback || clobbered) {
    clearImeSession(element);
    return { status: "aborted-deferred", step: stroke.preeditSteps.length - 1 };
  }

  return { status: "ok" };
}

/** Safari broken deferred-update: append preedit onto stale DOM value (OS capture). */
async function playSafariDeferredBroken(
  trace: ImeTrace,
  strokes: HangulKeyStroke[],
  startIndex: number,
  startStep: number,
  suffix: string,
  profile: ImeProfile,
  settle: "microtask" | "macrotask",
) {
  const { element } = trace;

  for (let strokeIndex = startIndex; strokeIndex < strokes.length; strokeIndex++) {
    const stroke = strokes[strokeIndex];
    if (!stroke) continue;

    trace.compositionStart();
    const firstStep = strokeIndex === startIndex ? startStep : 0;

    for (let step = firstStep; step < stroke.preeditSteps.length; step++) {
      const preedit = stroke.preeditSteps[step] ?? "";
      if (step === firstStep && element.value.endsWith(preedit)) {
        continue;
      }
      const appended = element.value + preedit;
      const value = appended + suffix;
      applyPreedit(trace, preedit, value, appended.length);
      trace.keydown({
        ...hangulKeydownFields(profile, stroke),
        isComposing: false,
      });
      trace.keyup({
        ...hangulKeyupFields(profile, stroke, false),
      });
      await settleAfterPreedit(settle);
    }
  }
}

export async function composeHangulSafariComposition(
  element: HTMLInputElement | HTMLTextAreaElement,
  strokes: HangulKeyStroke[],
  suffix: string,
  profile: ImeProfile,
  options: Pick<ComposeHangulOptions, "commitFinal" | "settle" | "deferredUpdateRace">,
): Promise<ComposedEventRecord[]> {
  const { settle = "macrotask", deferredUpdateRace = false } = options;
  const trace = new ImeTrace(element);

  for (let index = 0; index < strokes.length; index++) {
    const stroke = strokes[index];
    if (!stroke) continue;

    const result = await playStrokeSafariComposition(
      trace,
      stroke,
      suffix,
      profile,
      settle ?? "macrotask",
      deferredUpdateRace ?? false,
    );

    if (result.status === "aborted-deferred") {
      await playSafariDeferredBroken(
        trace,
        strokes,
        index,
        result.step,
        suffix,
        profile,
        settle ?? "macrotask",
      );
      return trace.records;
    }

    if (result.status === "maxlength-reject") {
      return trace.records;
    }

    const finalPreedit = stroke.preeditSteps[stroke.preeditSteps.length - 1] ?? "";
    const finalValue = stroke.valuesAfterSteps[stroke.valuesAfterSteps.length - 1] ?? element.value;
    if (shouldConfirmAfterStroke(strokes, index) && finalPreedit) {
      commitSafariSyllable(trace, finalPreedit, finalValue);
      if (index < strokes.length - 1) {
        restartSafariComposition(trace);
      }
    }
  }

  return trace.records;
}

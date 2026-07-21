import type { HangulKeyStroke } from "../planHangulKeystrokes";
import {
  applyReplacementText,
  clearImeSession,
  commitSafariSyllable,
  hangulKeydownFields,
  hangulKeyupFields,
  ImeTrace,
  playEventPlan,
  readMaxLength,
  replacementInputType,
  restartSafariComposition,
  type ComposedEventRecord,
} from "../_internal";
import { consumeImeControlledWriteback } from "../markImeControlledWriteback";
import type { ImeProfile } from "../profiles";

import type { ComposeHangulOptions } from "./composeHangul";
import {
  decideSafariOverflow,
  decideStrokeStepOutcome,
  planChromePreeditStep,
  planSafariBoundaryCommit,
  planSafariDeferredBrokenStep,
  planSafariOverflowReject,
  planSafariStrokeCompositionStart,
  planSafariStrokeKeys,
} from "./planStroke";

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

      playEventPlan(trace, [
        {
          kind: "keydown",
          fields: {
            ...hangulKeydownFields(profile, stroke),
            isComposing: false,
          },
        },
        {
          kind: "keyup",
          fields: { ...hangulKeyupFields(profile, stroke, false) },
        },
      ]);

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

  playEventPlan(trace, planSafariStrokeCompositionStart(stroke));

  for (let i = 0; i < stroke.preeditSteps.length; i++) {
    const preedit = stroke.preeditSteps[i] ?? "";
    const value = stroke.valuesAfterSteps[i] ?? element.value;
    const caret = carets[i] ?? value.length - suffix.length;

    playEventPlan(
      trace,
      planChromePreeditStep(preedit, value, caret, suffix, {
        valueBefore: element.value,
        maxLength: readMaxLength(element),
      }),
    );

    const overflow = decideSafariOverflow({
      maxLength: limit,
      plannedValue: value,
      domValue: element.value,
    });

    if (overflow) {
      playEventPlan(
        trace,
        planSafariOverflowReject(
          stroke,
          profile,
          preedit,
          value,
          limit!,
          overflow.hostClamped,
          overflow.clamped,
          {
            valueBefore: element.value,
            maxLength: limit,
          },
        ),
      );
      return { status: "maxlength-reject" };
    }

    playEventPlan(trace, planSafariBoundaryCommit(stroke, element.value, i));
  }

  playEventPlan(trace, planSafariStrokeKeys(stroke, profile));

  await settleAfterPreedit(settle);
  if (deferredUpdateRace) {
    await settleAfterPreedit(settle);
  }

  const lastValue = stroke.valuesAfterSteps[stroke.valuesAfterSteps.length - 1] ?? element.value;
  const writeback = deferredUpdateRace && consumeImeControlledWriteback(element);
  const outcome = decideStrokeStepOutcome({
    plannedValue: lastValue,
    domValue: element.value,
    blurred: false,
    writeback: Boolean(writeback),
  });

  if (outcome === "aborted-deferred") {
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

    playEventPlan(trace, [{ kind: "compositionstart" }]);
    const firstStep = strokeIndex === startIndex ? startStep : 0;

    for (let step = firstStep; step < stroke.preeditSteps.length; step++) {
      const preedit = stroke.preeditSteps[step] ?? "";
      if (step === firstStep && element.value.endsWith(preedit)) {
        continue;
      }
      const appended = element.value + preedit;
      const value = appended + suffix;
      playEventPlan(
        trace,
        planSafariDeferredBrokenStep(stroke, profile, preedit, value, appended.length, {
          valueBefore: element.value,
          maxLength: readMaxLength(element),
        }),
      );
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

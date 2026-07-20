import type { HangulKeyStroke } from "../planHangulKeystrokes";
import {
  applyPreedit,
  applyReplacementText,
  clearImeSession,
  commitSafariSyllable,
  hangulKeydownFields,
  hangulKeyupFields,
  pushCompositionStart,
  pushKeydown,
  pushKeyup,
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

function confirmSyllable(
  element: HTMLInputElement | HTMLTextAreaElement,
  syllable: string,
  records: ComposedEventRecord[],
) {
  applyReplacementText(element, syllable, element.value, records, "insertReplacementText");
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
  const records: ComposedEventRecord[] = [];

  for (let strokeIndex = 0; strokeIndex < strokes.length; strokeIndex++) {
    const stroke = strokes[strokeIndex];
    if (!stroke) continue;

    for (let i = 0; i < stroke.preeditSteps.length; i++) {
      const preedit = stroke.preeditSteps[i] ?? "";
      const value = stroke.valuesAfterSteps[i] ?? element.value;
      const caret = value.length - suffix.length;
      const previousValue = element.value;

      applyReplacementText(
        element,
        preedit,
        value,
        records,
        replacementInputType(previousValue, value, preedit),
        caret,
      );

      pushKeydown(element, records, {
        ...hangulKeydownFields(profile, stroke),
        isComposing: false,
      });
      pushKeyup(element, records, {
        ...hangulKeyupFields(profile, stroke, false),
      });

      await settleAfterPreedit(settle ?? "microtask");
    }

    const finalPreedit = stroke.preeditSteps[stroke.preeditSteps.length - 1] ?? "";
    if (shouldConfirmAfterStroke(strokes, strokeIndex) && finalPreedit) {
      confirmSyllable(element, finalPreedit, records);
    }
  }

  return records;
}

/** macOS Safari Apple composition order: update → input → keydown (fixed delayed-update captures). */
async function playStrokeSafariComposition(
  element: HTMLInputElement | HTMLTextAreaElement,
  stroke: HangulKeyStroke,
  suffix: string,
  records: ComposedEventRecord[],
  profile: ImeProfile,
  settle: "microtask" | "macrotask",
  deferredUpdateRace: boolean,
): Promise<{ status: "aborted-deferred"; step: number } | { status: "ok" }> {
  const carets = stroke.valuesAfterSteps.map((value) => value.length - suffix.length);

  if (stroke.compositionStart) {
    pushCompositionStart(element, records);
  }

  for (let i = 0; i < stroke.preeditSteps.length; i++) {
    const preedit = stroke.preeditSteps[i] ?? "";
    const value = stroke.valuesAfterSteps[i] ?? element.value;
    const caret = carets[i] ?? value.length - suffix.length;

    updateImeSessionForPreedit(element, preedit, value, caret, suffix);
    applyPreedit(element, preedit, value, records, caret);

    pushKeydown(element, records, {
      ...hangulKeydownFields(profile, stroke),
      isComposing: true,
    });
    pushKeyup(element, records, {
      ...hangulKeyupFields(profile, stroke, true),
    });

    await settleAfterPreedit(settle);
    if (deferredUpdateRace) {
      await settleAfterPreedit(settle);
    }

    const writeback = deferredUpdateRace && consumeImeControlledWriteback(element);
    const clobbered = element.value !== value;

    if (writeback || clobbered) {
      clearImeSession(element);
      return { status: "aborted-deferred", step: i };
    }
  }

  return { status: "ok" };
}

/** Safari broken deferred-update: append preedit onto stale DOM value (OS capture). */
async function playSafariDeferredBroken(
  element: HTMLInputElement | HTMLTextAreaElement,
  strokes: HangulKeyStroke[],
  startIndex: number,
  startStep: number,
  suffix: string,
  profile: ImeProfile,
  records: ComposedEventRecord[],
  settle: "microtask" | "macrotask",
) {
  for (let strokeIndex = startIndex; strokeIndex < strokes.length; strokeIndex++) {
    const stroke = strokes[strokeIndex];
    if (!stroke) continue;

    pushCompositionStart(element, records);
    const firstStep = strokeIndex === startIndex ? startStep : 0;

    for (let step = firstStep; step < stroke.preeditSteps.length; step++) {
      const preedit = stroke.preeditSteps[step] ?? "";
      if (step === firstStep && element.value.endsWith(preedit)) {
        continue;
      }
      const appended = element.value + preedit;
      const value = appended + suffix;
      applyPreedit(element, preedit, value, records, appended.length);
      pushKeydown(element, records, {
        ...hangulKeydownFields(profile, stroke),
        isComposing: false,
      });
      pushKeyup(element, records, {
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
  const records: ComposedEventRecord[] = [];

  for (let index = 0; index < strokes.length; index++) {
    const stroke = strokes[index];
    if (!stroke) continue;

    const result = await playStrokeSafariComposition(
      element,
      stroke,
      suffix,
      records,
      profile,
      settle ?? "macrotask",
      deferredUpdateRace ?? false,
    );

    if (result.status === "aborted-deferred") {
      await playSafariDeferredBroken(
        element,
        strokes,
        index,
        result.step,
        suffix,
        profile,
        records,
        settle ?? "macrotask",
      );
      return records;
    }

    const finalPreedit = stroke.preeditSteps[stroke.preeditSteps.length - 1] ?? "";
    const finalValue = stroke.valuesAfterSteps[stroke.valuesAfterSteps.length - 1] ?? element.value;
    if (shouldConfirmAfterStroke(strokes, index) && finalPreedit) {
      commitSafariSyllable(element, finalPreedit, finalValue, records);
      if (index < strokes.length - 1) {
        restartSafariComposition(element, records);
      }
    }
  }

  return records;
}

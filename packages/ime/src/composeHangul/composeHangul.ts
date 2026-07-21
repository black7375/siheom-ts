import { planHangulKeystrokes, withSuffix, type HangulKeyStroke } from "../planHangulKeystrokes";
import {
  ImeTrace,
  playEventPlan,
  readMaxLength,
  setImeSession,
  takePendingMaxLengthReject,
  type ComposedEventRecord,
} from "../_internal";
import { consumeImeControlledWriteback } from "../markImeControlledWriteback";
import { resolveProfile, type ImeProfile } from "../profiles";
import {
  composeHangulSafariComposition,
  composeHangulSafariReplacement,
} from "./composeHangulSafari";
import { composeHangulContentEditableFirefoxBroken } from "./composeHangulContentEditableFirefoxBroken";
import { composeHangulContentEditableFirefoxFixed } from "./composeHangulContentEditableFirefoxFixed";
import { composeHangulContentEditableAndroidFirefoxFixed } from "./composeHangulContentEditableAndroidFirefoxFixed";
import { composeHangulAndroidChromeSlatePlaceholderBroken } from "./composeHangulAndroidChromeSlatePlaceholderBroken";
import { composeHangulAndroidChromeSlatePlainControl } from "./composeHangulAndroidChromeSlatePlainControl";
import {
  decideStrokeStepOutcome,
  planBoundaryCommitAfterStep,
  planChromeBlurAbortTail,
  planChromeDeferredAbortTail,
  planChromePendingOverflowReject,
  planChromeStrokeHead,
  planChromeStrokeKeyup,
  planEndComposition,
  planIsolatedJamo,
} from "./planStroke";
import { playPreeditStep } from "./playPreeditStep";
import { settleAfterPreedit } from "./settle";

export type { ComposedEventRecord } from "../_internal";

export type ComposeHangulOptions = {
  /** When true (default), fire compositionend for the final syllable */
  commitFinal?: boolean;
  /**
   * When to yield after each preedit so host code (React setState, focus bounce) can run.
   * - `microtask` (default): focus-steal blur detection
   * - `macrotask`: `setTimeout(0)` — needed for deferred React writeback races
   */
  settle?: "microtask" | "macrotask";
  /**
   * After each macrotask settle, if the host marked a controlled writeback
   * (`markImeControlledWriteback`) or the DOM value no longer matches the planned
   * preedit, abort continuous composition and type remaining jamos in isolation
   * *without* compositionend — matching Linux delayed-update OS captures.
   */
  deferredUpdateRace?: boolean;
  /** OS IME profile (defaults to linux-chrome-ibus-hangul). */
  profile?: string | ImeProfile;
};

type StrokeAbort = "aborted-blur" | "aborted-deferred" | "maxlength-reject" | "ok";

async function playRemainingIsolated(
  trace: ImeTrace,
  remaining: string[],
  suffix: string,
  settle: "microtask" | "macrotask",
  commit: boolean,
  profile: ImeProfile,
) {
  for (const jamo of remaining) {
    const { element } = trace;
    const committed = element.value.slice(0, element.value.length - suffix.length);
    playEventPlan(
      trace,
      planIsolatedJamo(jamo, committed, suffix, profile, commit, {
        valueBefore: element.value,
        maxLength: readMaxLength(element),
      }),
    );
    await settleAfterPreedit(settle);
  }
}

async function playStrokeRespectingBlur(
  trace: ImeTrace,
  stroke: HangulKeyStroke,
  suffix: string,
  blurred: { current: boolean },
  settle: "microtask" | "macrotask",
  deferredUpdateRace: boolean,
  profile: ImeProfile,
): Promise<StrokeAbort> {
  const { element } = trace;
  const carets = stroke.valuesAfterSteps.map((value) => value.length - suffix.length);

  playEventPlan(trace, planChromeStrokeHead(stroke, profile));

  for (let i = 0; i < stroke.preeditSteps.length; i++) {
    const preedit = stroke.preeditSteps[i] ?? "";
    const value = stroke.valuesAfterSteps[i] ?? element.value;
    const caret = carets[i] ?? value.length - suffix.length;

    playPreeditStep(trace, preedit, value, caret, suffix);
    await settleAfterPreedit(settle);

    const writeback = deferredUpdateRace && consumeImeControlledWriteback(element);
    const outcome = decideStrokeStepOutcome({
      plannedValue: value,
      domValue: element.value,
      blurred: blurred.current,
      writeback: Boolean(writeback),
    });

    if (outcome === "aborted-deferred") {
      playEventPlan(trace, planChromeDeferredAbortTail(stroke, profile));
      return "aborted-deferred";
    }

    if (outcome === "aborted-blur") {
      blurred.current = false;
      playEventPlan(trace, planChromeBlurAbortTail(stroke, profile, preedit));
      return "aborted-blur";
    }

    playEventPlan(trace, planBoundaryCommitAfterStep(stroke, value, i));
  }

  playEventPlan(trace, planChromeStrokeKeyup(stroke, profile));

  const pendingReject = takePendingMaxLengthReject(element);
  if (pendingReject) {
    const limit = readMaxLength(element);
    if (limit !== null && element.value.length > limit) {
      playEventPlan(
        trace,
        planChromePendingOverflowReject(pendingReject.preedit, pendingReject.overflowValue, limit),
      );
    }
    return "maxlength-reject";
  }

  return "ok";
}

/**
 * Type Hangul `text` into an input by dispatching composition-faithful events.
 * If the field blurs mid-composition (focus-steal), remaining jamos are typed as
 * isolated compositions — matching OS 풀어쓰기 (e.g. 김태희 → ㄱㅣㅁㅌㅐㅎㅡㅣ).
 * Deferred controlled writeback aborts similarly but without compositionend events.
 */
export async function composeHangul(
  element: HTMLInputElement | HTMLTextAreaElement,
  text: string,
  options: ComposeHangulOptions = {},
): Promise<ComposedEventRecord[]> {
  const {
    commitFinal = true,
    settle = "microtask",
    deferredUpdateRace = false,
    profile: profileOpt,
  } = options;
  const profile = resolveProfile(profileOpt);
  const selectionStart = element.selectionStart ?? element.value.length;
  const selectionEnd = element.selectionEnd ?? element.value.length;
  const prefix = element.value.slice(0, selectionStart);
  const suffix = element.value.slice(selectionEnd);
  const strokes = planHangulKeystrokes(text, {
    prefix,
    compositionBoundary: profile.hangulCompositionBoundary,
  });
  const trace = new ImeTrace(element);

  if (
    profile.id === "macos-safari-apple" &&
    (settle === "macrotask" || readMaxLength(element) !== null)
  ) {
    element.focus();
    return composeHangulSafariComposition(element, strokes, suffix, profile, {
      commitFinal,
      settle,
      deferredUpdateRace,
    });
  }

  if (profile.hangulComposeMode === "replacement") {
    element.focus();
    return composeHangulSafariReplacement(element, strokes, suffix, profile, {
      settle,
    });
  }

  if (profile.hangulComposeMode === "contenteditable-firefox-broken") {
    element.focus();
    return composeHangulContentEditableFirefoxBroken(element, text, { commitFinal });
  }

  if (profile.hangulComposeMode === "contenteditable-firefox-fixed") {
    element.focus();
    return composeHangulContentEditableFirefoxFixed(element, text, { commitFinal, profile });
  }

  if (profile.hangulComposeMode === "contenteditable-firefox-af-fixed") {
    element.focus();
    return composeHangulContentEditableAndroidFirefoxFixed(element, text);
  }

  if (profile.hangulComposeMode === "android-chrome-slate-placeholder-broken") {
    element.focus();
    return composeHangulAndroidChromeSlatePlaceholderBroken(element, text);
  }

  if (profile.hangulComposeMode === "android-chrome-slate-plain-control") {
    element.focus();
    return composeHangulAndroidChromeSlatePlainControl(element, text);
  }

  const blurred = { current: false };
  const onBlur = () => {
    blurred.current = true;
  };
  element.addEventListener("blur", onBlur);
  element.focus();

  const strokesWithSuffix = withSuffix(strokes, suffix);

  try {
    for (let index = 0; index < strokesWithSuffix.length; index++) {
      const stroke = strokesWithSuffix[index];
      if (!stroke) continue;

      const result = await playStrokeRespectingBlur(
        trace,
        stroke,
        suffix,
        blurred,
        settle,
        deferredUpdateRace,
        profile,
      );

      if (result === "aborted-blur" || result === "aborted-deferred") {
        const remaining = strokesWithSuffix.slice(index + 1).map((s) => s.jamo);
        await playRemainingIsolated(
          trace,
          remaining,
          suffix,
          settle,
          result === "aborted-blur",
          profile,
        );
        return trace.records;
      }

      if (result === "maxlength-reject") {
        return trace.records;
      }
    }

    if (strokesWithSuffix.length === 0) {
      return trace.records;
    }

    const last = strokesWithSuffix[strokesWithSuffix.length - 1];
    const finalPreedit = last?.preeditSteps[last.preeditSteps.length - 1] ?? "";
    const committed = element.value.slice(
      0,
      element.value.length - suffix.length - finalPreedit.length,
    );

    if (commitFinal) {
      playEventPlan(trace, planEndComposition(finalPreedit));
    } else {
      setImeSession(element, {
        composing: true,
        committed,
        preedit: finalPreedit,
        suffix,
      });
    }

    return trace.records;
  } finally {
    element.removeEventListener("blur", onBlur);
  }
}

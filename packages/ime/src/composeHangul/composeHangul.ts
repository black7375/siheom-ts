import { planHangulKeystrokes, withSuffix, type HangulKeyStroke } from "../planHangulKeystrokes";
import {
  applyPreedit,
  clearImeSession,
  commitBetweenPreeditSteps,
  hangulKeydownFields,
  hangulKeyupFields,
  ImeTrace,
  keyForJamo,
  readMaxLength,
  rejectChromeCompositionOverflow,
  setImeSession,
  takePendingMaxLengthReject,
  updateImeSessionForPreedit,
  type ComposedEventRecord,
} from "../_internal";
import { consumeImeControlledWriteback } from "../markImeControlledWriteback";
import { resolveProfile, type ImeProfile } from "../profiles";
import {
  composeHangulSafariComposition,
  composeHangulSafariReplacement,
} from "./composeHangulSafari";

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

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

async function flushMacrotask() {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

async function settleAfterPreedit(kind: "microtask" | "macrotask") {
  if (kind === "microtask") {
    await flushMicrotasks();
    return;
  }
  await flushMacrotask();
}

function endComposition(trace: ImeTrace, data: string) {
  trace.compositionEnd(data);
  clearImeSession(trace.element);
}

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
    await playIsolatedJamo(trace, jamo, suffix, settle, { commit }, profile);
  }
}

/** One jamo as its own composition session (after focus-steal / deferred abort). */
async function playIsolatedJamo(
  trace: ImeTrace,
  jamo: string,
  suffix: string,
  settle: "microtask" | "macrotask",
  options: { commit: boolean },
  profile: ImeProfile,
) {
  const { element } = trace;
  const meta = keyForJamo(jamo);
  const stroke = { jamo, code: meta.code, key: meta.key };
  const committed = element.value.slice(0, element.value.length - suffix.length);
  const value = committed + jamo + suffix;
  const caret = committed.length + jamo.length;

  trace.keydown({
    ...hangulKeydownFields(profile, stroke),
    isComposing: false,
  });

  trace.compositionStart();

  setImeSession(element, {
    composing: true,
    committed,
    preedit: jamo,
    suffix,
  });

  applyPreedit(trace, jamo, value, caret);
  await settleAfterPreedit(settle);

  if (options.commit) {
    endComposition(trace, jamo);
  } else {
    clearImeSession(element);
  }

  trace.keyup({
    ...hangulKeyupFields(profile, stroke, false),
  });
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

  trace.keydown({
    ...hangulKeydownFields(profile, stroke),
    isComposing: stroke.keydownIsComposing,
  });

  if (stroke.compositionStart) {
    trace.compositionStart();
  }

  for (let i = 0; i < stroke.preeditSteps.length; i++) {
    const preedit = stroke.preeditSteps[i] ?? "";
    const value = stroke.valuesAfterSteps[i] ?? element.value;
    const caret = carets[i] ?? value.length - suffix.length;

    updateImeSessionForPreedit(element, preedit, value, caret, suffix);

    applyPreedit(trace, preedit, value, caret);
    await settleAfterPreedit(settle);

    const writeback = deferredUpdateRace && consumeImeControlledWriteback(element);
    const clobbered = element.value !== value;

    if (writeback || clobbered) {
      clearImeSession(element);
      trace.keyup({
        ...hangulKeyupFields(profile, stroke, false),
      });
      return "aborted-deferred";
    }

    if (blurred.current) {
      blurred.current = false;
      endComposition(trace, preedit);
      trace.keyup({
        ...hangulKeyupFields(profile, stroke, false),
      });
      return "aborted-blur";
    }

    commitBetweenPreeditSteps(trace, stroke, value, i);
  }

  trace.keyup({
    ...hangulKeyupFields(profile, stroke, true),
  });

  const pendingReject = takePendingMaxLengthReject(element);
  if (pendingReject) {
    const limit = readMaxLength(element);
    if (limit !== null && element.value.length > limit) {
      rejectChromeCompositionOverflow(trace, pendingReject.preedit, pendingReject.overflowValue);
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
  const strokes = planHangulKeystrokes(text, { prefix });
  const trace = new ImeTrace(element);

  if (profile.id === "macos-safari-apple" && settle === "macrotask") {
    element.focus();
    return composeHangulSafariComposition(element, strokes, suffix, profile, {
      commitFinal,
      settle,
      deferredUpdateRace,
    });
  }

  if (profile.id === "macos-safari-apple" && readMaxLength(element) !== null) {
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
      endComposition(trace, finalPreedit);
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

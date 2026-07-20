import { planHangulKeystrokes, type HangulKeyStroke } from "../planHangulKeystrokes";
import {
  applyPreedit,
  clearImeSession,
  commitBetweenPreeditSteps,
  dispatch,
  keyForJamo,
  pushCompositionStart,
  pushKeydown,
  pushKeyup,
  setImeSession,
  snapshot,
  updateImeSessionForPreedit,
  type ComposedEventRecord,
} from "../_internal";
import { consumeImeControlledWriteback } from "../markImeControlledWriteback";

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

function endComposition(
  element: HTMLInputElement | HTMLTextAreaElement,
  data: string,
  records: ComposedEventRecord[],
) {
  dispatch(element, "compositionend", { bubbles: true, data });
  records.push(
    snapshot(element, "compositionend", {
      data,
      value: element.value,
    }),
  );
  clearImeSession(element);
}

type StrokeAbort = "aborted-blur" | "aborted-deferred" | "ok";

async function playRemainingIsolated(
  element: HTMLInputElement | HTMLTextAreaElement,
  remaining: string[],
  suffix: string,
  records: ComposedEventRecord[],
  settle: "microtask" | "macrotask",
  commit: boolean,
) {
  for (const jamo of remaining) {
    await playIsolatedJamo(element, jamo, suffix, records, settle, { commit });
  }
}

/** One jamo as its own composition session (after focus-steal / deferred abort). */
async function playIsolatedJamo(
  element: HTMLInputElement | HTMLTextAreaElement,
  jamo: string,
  suffix: string,
  records: ComposedEventRecord[],
  settle: "microtask" | "macrotask",
  options: { commit: boolean },
) {
  const meta = keyForJamo(jamo);
  const committed = element.value.slice(0, element.value.length - suffix.length);
  const value = committed + jamo + suffix;
  const caret = committed.length + jamo.length;

  pushKeydown(element, records, {
    key: "Process",
    code: meta.code,
    keyCode: 229,
    isComposing: false,
  });

  pushCompositionStart(element, records);

  setImeSession(element, {
    composing: true,
    committed,
    preedit: jamo,
    suffix,
  });

  applyPreedit(element, jamo, value, records, caret);
  await settleAfterPreedit(settle);

  if (options.commit) {
    endComposition(element, jamo, records);
  } else {
    clearImeSession(element);
  }

  pushKeyup(element, records, {
    key: meta.key,
    code: meta.code,
    keyCode: meta.key.charCodeAt(0),
    isComposing: false,
  });
}

async function playStrokeRespectingBlur(
  element: HTMLInputElement | HTMLTextAreaElement,
  stroke: HangulKeyStroke,
  suffix: string,
  records: ComposedEventRecord[],
  blurred: { current: boolean },
  settle: "microtask" | "macrotask",
  deferredUpdateRace: boolean,
): Promise<StrokeAbort> {
  const carets = stroke.valuesAfterSteps.map((value) => value.length - suffix.length);

  pushKeydown(element, records, {
    key: "Process",
    code: stroke.code,
    keyCode: 229,
    isComposing: stroke.keydownIsComposing,
  });

  if (stroke.compositionStart) {
    pushCompositionStart(element, records);
  }

  for (let i = 0; i < stroke.preeditSteps.length; i++) {
    const preedit = stroke.preeditSteps[i] ?? "";
    const value = stroke.valuesAfterSteps[i] ?? element.value;
    const caret = carets[i] ?? value.length - suffix.length;

    updateImeSessionForPreedit(element, preedit, value, caret, suffix);

    applyPreedit(element, preedit, value, records, caret);
    await settleAfterPreedit(settle);

    const writeback = deferredUpdateRace && consumeImeControlledWriteback(element);
    const clobbered = element.value !== value;

    if (writeback || clobbered) {
      clearImeSession(element);
      pushKeyup(element, records, {
        key: stroke.key,
        code: stroke.code,
        keyCode: stroke.key.charCodeAt(0),
        isComposing: false,
      });
      return "aborted-deferred";
    }

    if (blurred.current) {
      blurred.current = false;
      endComposition(element, preedit, records);
      pushKeyup(element, records, {
        key: stroke.key,
        code: stroke.code,
        keyCode: stroke.key.charCodeAt(0),
        isComposing: false,
      });
      return "aborted-blur";
    }

    commitBetweenPreeditSteps(element, stroke, value, records, i);
  }

  pushKeyup(element, records, {
    key: stroke.key,
    code: stroke.code,
    keyCode: stroke.key.charCodeAt(0),
    isComposing: true,
  });
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
  const { commitFinal = true, settle = "microtask", deferredUpdateRace = false } = options;
  const selectionStart = element.selectionStart ?? element.value.length;
  const selectionEnd = element.selectionEnd ?? element.value.length;
  const prefix = element.value.slice(0, selectionStart);
  const suffix = element.value.slice(selectionEnd);
  const strokes = planHangulKeystrokes(text, { prefix });
  const records: ComposedEventRecord[] = [];

  const blurred = { current: false };
  const onBlur = () => {
    blurred.current = true;
  };
  element.addEventListener("blur", onBlur);
  element.focus();

  try {
    for (let index = 0; index < strokes.length; index++) {
      const stroke = strokes[index];
      if (!stroke) continue;

      stroke.valuesAfterSteps = stroke.valuesAfterSteps.map((value) => value + suffix);
      const result = await playStrokeRespectingBlur(
        element,
        stroke,
        suffix,
        records,
        blurred,
        settle,
        deferredUpdateRace,
      );

      if (result === "aborted-blur" || result === "aborted-deferred") {
        const remaining = strokes.slice(index + 1).map((s) => s.jamo);
        await playRemainingIsolated(
          element,
          remaining,
          suffix,
          records,
          settle,
          result === "aborted-blur",
        );
        return records;
      }
    }

    if (strokes.length === 0) {
      return records;
    }

    const last = strokes[strokes.length - 1];
    const finalPreedit = last?.preeditSteps[last.preeditSteps.length - 1] ?? "";
    const committed = element.value.slice(
      0,
      element.value.length - suffix.length - finalPreedit.length,
    );

    if (commitFinal) {
      endComposition(element, finalPreedit, records);
    } else {
      setImeSession(element, {
        composing: true,
        committed,
        preedit: finalPreedit,
        suffix,
      });
    }

    return records;
  } finally {
    element.removeEventListener("blur", onBlur);
  }
}

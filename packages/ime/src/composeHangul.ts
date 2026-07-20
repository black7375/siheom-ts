import { planHangulKeystrokes, type HangulKeyStroke } from "./hangulPlan";
import { keyForJamo } from "./jamoKeyMap";
import type { ComposedEventRecord } from "./composeHangulTypes";
import { applyPreedit, dispatch, snapshot } from "./composeHangulInternals";
import { clearImeSession, setImeSession } from "./imeSession";
import { consumeImeControlledWriteback } from "./imeWritebackSignal";

export type { ComposedEventRecord } from "./composeHangulTypes";
export { applyPreedit, dispatch, setInputValue, snapshot } from "./composeHangulInternals";

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

function pushKeyup(
  element: HTMLInputElement | HTMLTextAreaElement,
  key: string,
  code: string,
  isComposing: boolean,
  records: ComposedEventRecord[],
) {
  dispatch(element, "keyup", {
    bubbles: true,
    key,
    code,
    keyCode: key.charCodeAt(0),
    isComposing,
  });
  records.push(
    snapshot(element, "keyup", {
      key,
      code,
      keyCode: key.charCodeAt(0),
      isComposing,
    }),
  );
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

  dispatch(element, "keydown", {
    bubbles: true,
    cancelable: true,
    key: "Process",
    code: meta.code,
    keyCode: 229,
    isComposing: false,
  });
  records.push(
    snapshot(element, "keydown", {
      key: "Process",
      code: meta.code,
      keyCode: 229,
      isComposing: false,
    }),
  );

  dispatch(element, "compositionstart", { bubbles: true, data: "" });
  records.push(snapshot(element, "compositionstart", { data: "" }));

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
    // Delayed-update OS captures abandon composition without compositionend
    clearImeSession(element);
  }

  pushKeyup(element, meta.key, meta.code, false, records);
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

  dispatch(element, "keydown", {
    bubbles: true,
    cancelable: true,
    key: "Process",
    code: stroke.code,
    keyCode: 229,
    isComposing: stroke.keydownIsComposing,
  });
  records.push(
    snapshot(element, "keydown", {
      key: "Process",
      code: stroke.code,
      keyCode: 229,
      isComposing: stroke.keydownIsComposing,
    }),
  );

  if (stroke.compositionStart) {
    dispatch(element, "compositionstart", { bubbles: true, data: "" });
    records.push(snapshot(element, "compositionstart", { data: "" }));
  }

  for (let i = 0; i < stroke.preeditSteps.length; i++) {
    const preedit = stroke.preeditSteps[i] ?? "";
    const value = stroke.valuesAfterSteps[i] ?? element.value;
    const caret = carets[i] ?? value.length - suffix.length;

    const committedLen = caret - preedit.length;
    setImeSession(element, {
      composing: true,
      committed: value.slice(0, committedLen),
      preedit,
      suffix,
    });

    applyPreedit(element, preedit, value, records, caret);
    await settleAfterPreedit(settle);

    const writeback = deferredUpdateRace && consumeImeControlledWriteback(element);
    const clobbered = element.value !== value;

    if (writeback || clobbered) {
      // React re-applied controlled `value` — IME session dies without compositionend
      clearImeSession(element);
      pushKeyup(element, stroke.key, stroke.code, false, records);
      return "aborted-deferred";
    }

    if (blurred.current) {
      blurred.current = false;
      endComposition(element, preedit, records);
      pushKeyup(element, stroke.key, stroke.code, false, records);
      return "aborted-blur";
    }

    if (i === 0 && stroke.commitAfterFirstStep !== undefined) {
      dispatch(element, "compositionend", {
        bubbles: true,
        data: stroke.commitAfterFirstStep,
      });
      records.push(
        snapshot(element, "compositionend", {
          data: stroke.commitAfterFirstStep,
          value,
        }),
      );
      dispatch(element, "compositionstart", { bubbles: true, data: "" });
      records.push(snapshot(element, "compositionstart", { data: "" }));
    }
  }

  pushKeyup(element, stroke.key, stroke.code, true, records);
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
  } = options;
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

      if (result === "aborted-blur") {
        const remaining = strokes.slice(index + 1).map((s) => s.jamo);
        for (const jamo of remaining) {
          await playIsolatedJamo(element, jamo, suffix, records, settle, { commit: true });
        }
        return records;
      }

      if (result === "aborted-deferred") {
        // Current stroke already contributed its leading snapshot to the value;
        // later jamos are typed as isolated sessions without compositionend.
        const remaining = strokes.slice(index + 1).map((s) => s.jamo);
        for (const jamo of remaining) {
          await playIsolatedJamo(element, jamo, suffix, records, settle, { commit: false });
        }
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

/** Critical fields for golden-trace comparison (keyup order is flaky across captures). */
export function toCriticalEvents(events: ComposedEventRecord[]) {
  return events
    .filter((event) => event.type !== "keyup")
    .map((event) => ({
      type: event.type,
      key: event.key,
      code: event.code,
      keyCode: event.keyCode,
      isComposing: event.isComposing,
      inputType: event.inputType,
      data: event.data,
      value: event.value,
    }));
}

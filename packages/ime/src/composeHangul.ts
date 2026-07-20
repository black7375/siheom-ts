import { planHangulKeystrokes, type HangulKeyStroke } from "./hangulPlan";
import { keyForJamo } from "./jamoKeyMap";
import type { ComposedEventRecord } from "./composeHangulTypes";
import { applyPreedit, dispatch, snapshot } from "./composeHangulInternals";
import { clearImeSession, setImeSession } from "./imeSession";

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
   * With `settle: "macrotask"`, only flush every other preedit so an earlier
   * deferred setState can overwrite a newer IME value (stale controlled input bug).
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

async function settleAfterPreedit(
  kind: "microtask" | "macrotask",
  preeditIndex: number,
  deferredUpdateRace: boolean,
) {
  if (kind === "microtask") {
    await flushMicrotasks();
    return;
  }
  // macrotask: optionally skip odd steps so a prior setTimeout(0) setState can clobber
  if (deferredUpdateRace && preeditIndex % 2 === 0) {
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

/** One jamo as its own composition session (after focus-steal abort). */
async function playIsolatedJamo(
  element: HTMLInputElement | HTMLTextAreaElement,
  jamo: string,
  suffix: string,
  records: ComposedEventRecord[],
  blurred: { current: boolean },
  settle: "microtask" | "macrotask",
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
  await settleAfterPreedit(settle, 1, false);

  if (blurred.current) {
    blurred.current = false;
  }
  endComposition(element, jamo, records);

  dispatch(element, "keyup", {
    bubbles: true,
    key: meta.key,
    code: meta.code,
    keyCode: meta.key.charCodeAt(0),
    isComposing: false,
  });
  records.push(
    snapshot(element, "keyup", {
      key: meta.key,
      code: meta.code,
      keyCode: meta.key.charCodeAt(0),
      isComposing: false,
    }),
  );
}

async function playStrokeRespectingBlur(
  element: HTMLInputElement | HTMLTextAreaElement,
  stroke: HangulKeyStroke,
  suffix: string,
  records: ComposedEventRecord[],
  blurred: { current: boolean },
  settle: "microtask" | "macrotask",
  deferredUpdateRace: boolean,
  preeditCounter: { current: number },
): Promise<"aborted" | "ok"> {
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
    await settleAfterPreedit(settle, preeditCounter.current, deferredUpdateRace);
    preeditCounter.current += 1;

    // Stale React controlled `value` wrote back an older string over IME preedit
    if (element.value !== value) {
      endComposition(element, preedit, records);
      dispatch(element, "keyup", {
        bubbles: true,
        key: stroke.key,
        code: stroke.code,
        keyCode: stroke.key.charCodeAt(0),
        isComposing: false,
      });
      records.push(
        snapshot(element, "keyup", {
          key: stroke.key,
          code: stroke.code,
          keyCode: stroke.key.charCodeAt(0),
          isComposing: false,
        }),
      );
      return "aborted";
    }

    if (blurred.current) {
      blurred.current = false;
      endComposition(element, preedit, records);
      dispatch(element, "keyup", {
        bubbles: true,
        key: stroke.key,
        code: stroke.code,
        keyCode: stroke.key.charCodeAt(0),
        isComposing: false,
      });
      records.push(
        snapshot(element, "keyup", {
          key: stroke.key,
          code: stroke.code,
          keyCode: stroke.key.charCodeAt(0),
          isComposing: false,
        }),
      );
      return "aborted";
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

  dispatch(element, "keyup", {
    bubbles: true,
    key: stroke.key,
    code: stroke.code,
    keyCode: stroke.key.charCodeAt(0),
    isComposing: true,
  });
  records.push(
    snapshot(element, "keyup", {
      key: stroke.key,
      code: stroke.code,
      keyCode: stroke.key.charCodeAt(0),
      isComposing: true,
    }),
  );
  return "ok";
}

/**
 * Type Hangul `text` into an input by dispatching composition-faithful events.
 * If the field blurs mid-composition (focus-steal), remaining jamos are typed as
 * isolated compositions — matching OS 풀어쓰기 (e.g. 김태희 → ㄱㅣㅁㅌㅐㅎㅡㅣ).
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
  const preeditCounter = { current: 0 };

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
        preeditCounter,
      );

      if (result === "aborted") {
        const remaining = strokes.slice(index + 1).map((s) => s.jamo);
        for (const jamo of remaining) {
          await playIsolatedJamo(element, jamo, suffix, records, blurred, settle);
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

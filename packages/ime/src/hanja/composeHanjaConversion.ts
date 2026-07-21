import {
  applyPreedit,
  commitSafariInsertFromComposition,
  getImeSession,
  ImeTrace,
  setImeSession,
  type ComposedEventRecord,
} from "../_internal";
import { resolveProfile, type ImeProfile } from "../profiles";

export type ComposeHanjaConversionOptions = {
  hangul: string;
  hanja: string;
  profile?: string | ImeProfile;
};

/**
 * Play Option+Enter Hangul→Hanja candidate conversion for one syllable.
 * Assumes `hangul` is already the active preedit (composeHangul with commitFinal: false).
 */
export async function composeHanjaConversion(
  element: HTMLInputElement | HTMLTextAreaElement,
  options: ComposeHanjaConversionOptions,
): Promise<ComposedEventRecord[]> {
  const { hangul, hanja } = options;
  const profile = resolveProfile(options.profile);
  const trace = new ImeTrace(element);

  if (profile.hanjaConversion === "append") {
    playChromeAppendConversion(trace, hangul, hanja);
    return trace.records;
  }

  playSafariReplaceConversion(trace, hangul, hanja);
  return trace.records;
}

function sessionBounds(
  element: HTMLInputElement | HTMLTextAreaElement,
  hangul: string,
): { prefix: string; suffix: string } {
  const session = getImeSession(element);
  return {
    prefix: session?.committed ?? element.value.slice(0, element.value.length - hangul.length),
    suffix: session?.suffix ?? "",
  };
}

/** macOS Chrome Apple: Option+Enter appends Hanja after Hangul (김 → 김金). */
function playChromeAppendConversion(trace: ImeTrace, hangul: string, hanja: string) {
  const { element } = trace;
  const { prefix, suffix } = sessionBounds(element, hangul);
  const hangulValue = prefix + hangul + suffix;

  trace.keydown({
    key: "Alt",
    code: "AltLeft",
    keyCode: 18,
    isComposing: true,
  });
  trace.keydown({
    key: "Enter",
    code: "Enter",
    keyCode: 229,
    isComposing: true,
  });

  applyPreedit(trace, hangul, hangulValue, prefix.length + hangul.length);
  trace.compositionStart();

  const appended = prefix + hangul + hanja + suffix;
  applyPreedit(trace, hanja, appended, prefix.length + hangul.length + hanja.length);

  setImeSession(element, {
    composing: true,
    committed: prefix + hangul,
    preedit: hanja,
    suffix,
  });

  trace.keyup({
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    isComposing: true,
  });
  trace.keyup({
    key: "Alt",
    code: "AltLeft",
    keyCode: 18,
    isComposing: true,
  });
}

/**
 * macOS Safari Apple: Option starts conversion; Hangul is deleted then re-inserted,
 * then a new composition replaces it with Hanja (김 → 金).
 */
function playSafariReplaceConversion(trace: ImeTrace, hangul: string, hanja: string) {
  const { element } = trace;
  const { prefix, suffix } = sessionBounds(element, hangul);
  const hangulValue = prefix + hangul + suffix;

  trace.keydown({
    key: "Alt",
    code: "AltLeft",
    keyCode: 18,
    isComposing: true,
  });

  applyPreedit(trace, hangul, hangulValue, prefix.length + hangul.length);

  commitSafariInsertFromComposition(trace, hangul, hangulValue, {
    clearedCaret: prefix.length,
    finalCaret: prefix.length + hangul.length,
  });

  trace.compositionStart(hangul, hangulValue);

  const replaced = prefix + hanja + suffix;
  applyPreedit(trace, hanja, replaced, prefix.length + hanja.length);

  setImeSession(element, {
    composing: true,
    committed: prefix,
    preedit: hanja,
    suffix,
  });
}

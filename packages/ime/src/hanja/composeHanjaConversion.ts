import {
  applyPreedit,
  dispatch,
  getImeSession,
  pushCompositionStart,
  pushKeydown,
  pushKeyup,
  setImeSession,
  setInputValue,
  snapshot,
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
  const records: ComposedEventRecord[] = [];

  if (profile.hanjaConversion === "append") {
    playChromeAppendConversion(element, hangul, hanja, records);
    return records;
  }

  playSafariReplaceConversion(element, hangul, hanja, records);
  return records;
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
function playChromeAppendConversion(
  element: HTMLInputElement | HTMLTextAreaElement,
  hangul: string,
  hanja: string,
  records: ComposedEventRecord[],
) {
  const { prefix, suffix } = sessionBounds(element, hangul);
  const hangulValue = prefix + hangul + suffix;

  pushKeydown(element, records, {
    key: "Alt",
    code: "AltLeft",
    keyCode: 18,
    isComposing: true,
  });
  pushKeydown(element, records, {
    key: "Enter",
    code: "Enter",
    keyCode: 229,
    isComposing: true,
  });

  applyPreedit(element, hangul, hangulValue, records, prefix.length + hangul.length);
  pushCompositionStart(element, records);

  const appended = prefix + hangul + hanja + suffix;
  applyPreedit(element, hanja, appended, records, prefix.length + hangul.length + hanja.length);

  setImeSession(element, {
    composing: true,
    committed: prefix + hangul,
    preedit: hanja,
    suffix,
  });

  pushKeyup(element, records, {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    isComposing: true,
  });
  pushKeyup(element, records, {
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
function playSafariReplaceConversion(
  element: HTMLInputElement | HTMLTextAreaElement,
  hangul: string,
  hanja: string,
  records: ComposedEventRecord[],
) {
  const { prefix, suffix } = sessionBounds(element, hangul);
  const hangulValue = prefix + hangul + suffix;

  pushKeydown(element, records, {
    key: "Alt",
    code: "AltLeft",
    keyCode: 18,
    isComposing: true,
  });

  applyPreedit(element, hangul, hangulValue, records, prefix.length + hangul.length);

  dispatch(element, "beforeinput", {
    bubbles: true,
    cancelable: true,
    inputType: "deleteCompositionText",
    data: null,
    isComposing: true,
  });
  records.push(
    snapshot(element, "beforeinput", {
      inputType: "deleteCompositionText",
      data: null,
      isComposing: true,
      value: hangulValue,
    }),
  );

  const cleared = prefix + suffix;
  setInputValue(element, cleared, prefix.length);
  dispatch(element, "input", {
    bubbles: true,
    inputType: "deleteCompositionText",
    data: null,
    isComposing: true,
  });
  records.push(
    snapshot(element, "input", {
      inputType: "deleteCompositionText",
      data: null,
      isComposing: true,
      value: cleared,
    }),
  );

  dispatch(element, "beforeinput", {
    bubbles: true,
    cancelable: true,
    inputType: "insertFromComposition",
    data: hangul,
    isComposing: true,
  });
  records.push(
    snapshot(element, "beforeinput", {
      inputType: "insertFromComposition",
      data: hangul,
      isComposing: true,
      value: cleared,
    }),
  );

  setInputValue(element, hangulValue, prefix.length + hangul.length);
  dispatch(element, "input", {
    bubbles: true,
    inputType: "insertFromComposition",
    data: hangul,
    isComposing: true,
  });
  records.push(
    snapshot(element, "input", {
      inputType: "insertFromComposition",
      data: hangul,
      isComposing: true,
      value: hangulValue,
    }),
  );

  dispatch(element, "compositionstart", { bubbles: true, data: hangul });
  records.push(snapshot(element, "compositionstart", { data: hangul, value: hangulValue }));

  const replaced = prefix + hanja + suffix;
  applyPreedit(element, hanja, replaced, records, prefix.length + hanja.length);

  setImeSession(element, {
    composing: true,
    committed: prefix,
    preedit: hanja,
    suffix,
  });
}

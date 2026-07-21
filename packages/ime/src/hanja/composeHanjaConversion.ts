import {
  applyPreedit,
  getImeSession,
  pushCompositionStart,
  pushKeydown,
  pushKeyup,
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
  const records: ComposedEventRecord[] = [];

  if (profile.hanjaConversion === "append") {
    playChromeAppendConversion(element, hangul, hanja, records);
    return records;
  }

  throw new Error(`hanjaConversion "${profile.hanjaConversion}" not implemented yet`);
}

/** macOS Chrome Apple: Option+Enter appends Hanja after Hangul (김 → 김金). */
function playChromeAppendConversion(
  element: HTMLInputElement | HTMLTextAreaElement,
  hangul: string,
  hanja: string,
  records: ComposedEventRecord[],
) {
  const session = getImeSession(element);
  const prefix = session?.committed ?? element.value.slice(0, element.value.length - hangul.length);
  const suffix = session?.suffix ?? "";
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

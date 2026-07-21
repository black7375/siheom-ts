import {
  getImeSession,
  ImeTrace,
  playEventPlan,
  readMaxLength,
  type ComposedEventRecord,
} from "../_internal";
import { resolveProfile, type ImeProfile } from "../profiles";
import { planHanjaConversion } from "./planHanja";

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
  const session = getImeSession(element);
  const bounds = {
    prefix: session?.committed ?? element.value.slice(0, element.value.length - hangul.length),
    suffix: session?.suffix ?? "",
  };

  playEventPlan(
    trace,
    planHanjaConversion({
      mode: profile.hanjaConversion,
      hangul,
      hanja,
      bounds,
      facts: {
        valueBefore: element.value,
        maxLength: readMaxLength(element),
      },
    }),
  );

  return trace.records;
}

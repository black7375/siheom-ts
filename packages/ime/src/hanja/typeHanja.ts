import {
  applyPreedit,
  clearImeSession,
  commitSafariInsertFromComposition,
  getImeSession,
  ImeTrace,
  setInputValue,
  type ComposedEventRecord,
} from "../_internal";
import { composeHangul } from "../composeHangul";
import { resolveProfile, type ImeProfile } from "../profiles";
import { composeHanjaConversion } from "./composeHanjaConversion";

export type TypeHanjaOptions = {
  profile?: string | ImeProfile;
};

/**
 * Type Hanja by composing each Hangul reading then converting via Option+Enter.
 * `hanja` and `hangul` must be the same length in Unicode code points
 * (e.g. typeHanja(el, "金泰熙", "김태희")).
 */
export async function typeHanja(
  element: HTMLInputElement | HTMLTextAreaElement,
  hanja: string,
  hangul: string,
  options: TypeHanjaOptions = {},
): Promise<ComposedEventRecord[]> {
  const profile = resolveProfile(options.profile);
  const hanjaChars = [...hanja];
  const hangulChars = [...hangul];

  if (hanjaChars.length !== hangulChars.length) {
    throw new Error(
      `typeHanja: hanja (${hanjaChars.length}) and hangul (${hangulChars.length}) length must match`,
    );
  }

  const trace = new ImeTrace(element);
  const hangulProfile = hangulProfileForConversion(profile);

  for (let i = 0; i < hanjaChars.length; i++) {
    const hanjaChar = hanjaChars[i]!;
    const hangulChar = hangulChars[i]!;

    trace.append(
      await composeHangul(element, hangulChar, {
        commitFinal: false,
        profile: hangulProfile,
      }),
    );
    trace.append(
      await composeHanjaConversion(element, {
        hangul: hangulChar,
        hanja: hanjaChar,
        profile,
      }),
    );
    confirmHanjaCandidate(trace, hangulChar, hanjaChar, profile);
  }

  return trace.records;
}

/** Replacement-mode Hangul cannot stay composing for Option+Enter; use composition. */
function hangulProfileForConversion(profile: ImeProfile): ImeProfile {
  if (profile.hangulComposeMode !== "replacement") return profile;
  return { ...profile, hangulComposeMode: "composition" };
}

/**
 * Confirm the Hanja candidate and leave the field ready for the next syllable.
 * Append: Enter + preedit pulse at 김金, then compositionend + settle to hanja-only.
 * Replace: OS pulses / Enter / delete+insertFromComposition commit (see Safari golden).
 */
function confirmHanjaCandidate(
  trace: ImeTrace,
  hangul: string,
  hanja: string,
  profile: ImeProfile,
): void {
  if (profile.hanjaConversion === "append") {
    confirmChromeAppendCandidate(trace, hangul, hanja);
    return;
  }
  confirmSafariReplaceCandidate(trace, hangul, hanja);
}

function confirmChromeAppendCandidate(trace: ImeTrace, hangul: string, hanja: string): void {
  const { element } = trace;
  const session = getImeSession(element);
  const suffix = session?.suffix ?? "";
  const committed = session?.committed ?? "";
  const committedPrefix = committed.endsWith(hangul)
    ? committed.slice(0, -hangul.length)
    : committed;

  const appended = element.value;
  trace.keydown({
    key: "Enter",
    code: "Enter",
    keyCode: 229,
    isComposing: true,
  });

  applyPreedit(trace, hanja, appended, committedPrefix.length + hangul.length + hanja.length);

  const settled = committedPrefix + hanja + suffix;
  trace.compositionEnd(hanja);
  setInputValue(element, settled, committedPrefix.length + hanja.length);
  clearImeSession(element);
}

function confirmSafariReplaceCandidate(trace: ImeTrace, _hangul: string, hanja: string): void {
  const { element } = trace;
  const session = getImeSession(element);
  const suffix = session?.suffix ?? "";
  const committedPrefix =
    session?.committed ?? element.value.slice(0, Math.max(0, element.value.length - hanja.length));
  const settled = committedPrefix + hanja + suffix;
  const caret = committedPrefix.length + hanja.length;

  applyPreedit(trace, hanja, settled, caret);
  applyPreedit(trace, hanja, settled, caret);

  trace.keydown({
    key: "Enter",
    code: "Enter",
    keyCode: 229,
    isComposing: true,
  });

  applyPreedit(trace, hanja, settled, caret);
  commitSafariInsertFromComposition(trace, hanja, settled);

  trace.keydown({
    key: "Enter",
    code: "Enter",
    keyCode: 229,
    isComposing: false,
  });

  clearImeSession(element);
}

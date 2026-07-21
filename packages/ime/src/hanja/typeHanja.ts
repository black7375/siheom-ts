import {
  clearImeSession,
  dispatch,
  getImeSession,
  setInputValue,
  snapshot,
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

  const records: ComposedEventRecord[] = [];
  const hangulProfile = hangulProfileForConversion(profile);

  for (let i = 0; i < hanjaChars.length; i++) {
    const hanjaChar = hanjaChars[i]!;
    const hangulChar = hangulChars[i]!;

    records.push(
      ...(await composeHangul(element, hangulChar, {
        commitFinal: false,
        profile: hangulProfile,
      })),
    );
    records.push(
      ...(await composeHanjaConversion(element, {
        hangul: hangulChar,
        hanja: hanjaChar,
        profile,
      })),
    );
    records.push(...confirmHanjaCandidate(element, hangulChar, hanjaChar, profile));
  }

  return records;
}

/** Replacement-mode Hangul cannot stay composing for Option+Enter; use composition. */
function hangulProfileForConversion(profile: ImeProfile): ImeProfile {
  if (profile.hangulComposeMode !== "replacement") return profile;
  return { ...profile, hangulComposeMode: "composition" };
}

/**
 * Confirm the Hanja candidate and leave the field ready for the next syllable.
 * Append profiles briefly show hangul+hanja (김金); settle to hanja-only so chaining works
 * (same end state apps get after stripping on compositionend).
 */
function confirmHanjaCandidate(
  element: HTMLInputElement | HTMLTextAreaElement,
  hangul: string,
  hanja: string,
  profile: ImeProfile,
): ComposedEventRecord[] {
  const records: ComposedEventRecord[] = [];
  const session = getImeSession(element);
  const suffix = session?.suffix ?? "";

  let committedPrefix: string;
  if (profile.hanjaConversion === "append") {
    const committed = session?.committed ?? "";
    committedPrefix = committed.endsWith(hangul) ? committed.slice(0, -hangul.length) : committed;

    const appended = element.value;
    dispatch(element, "keydown", {
      bubbles: true,
      cancelable: true,
      key: "Enter",
      code: "Enter",
      keyCode: 229,
      isComposing: true,
    });
    records.push(
      snapshot(element, "keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 229,
        isComposing: true,
        value: appended,
      }),
    );
  } else {
    committedPrefix = session?.committed ?? element.value.slice(0, Math.max(0, element.value.length - hanja.length));
  }

  const settled = committedPrefix + hanja + suffix;

  dispatch(element, "compositionend", { bubbles: true, data: hanja });
  records.push(snapshot(element, "compositionend", { data: hanja, value: element.value }));

  setInputValue(element, settled, committedPrefix.length + hanja.length);
  clearImeSession(element);

  return records;
}

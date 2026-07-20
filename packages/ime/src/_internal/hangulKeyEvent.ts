import type { ImeProfile } from "../profiles";
import { keyForJamo } from "./jamoKeyMap";

export function hangulKeydownFields(
  profile: ImeProfile,
  stroke: JamoStroke,
): { key: string; code: string; keyCode: number } {
  const meta = keyForJamo(stroke.jamo);
  if (profile.hangulKeyEventKey === "jamo") {
    return { key: stroke.jamo, code: stroke.code, keyCode: 229 };
  }
  return { key: "Process", code: stroke.code, keyCode: 229 };
}

export function hangulKeyupFields(
  profile: ImeProfile,
  stroke: JamoStroke,
  isComposing: boolean,
): { key: string; code: string; keyCode: number; isComposing: boolean } {
  const meta = keyForJamo(stroke.jamo);
  if (profile.hangulKeyEventKey === "jamo") {
    return {
      key: stroke.jamo,
      code: stroke.code,
      keyCode: meta.keyCode,
      isComposing,
    };
  }
  return {
    key: stroke.key,
    code: stroke.code,
    keyCode: stroke.key.charCodeAt(0),
    isComposing,
  };
}

type JamoStroke = {
  jamo: string;
  code: string;
  key: string;
};
import { combineVowels } from "es-hangul";

/** Fold multi-jamo jungseong strings (e.g. ㅡ+ㅣ) into one syllable vowel when possible. */
export function normalizeJungseong(raw: string): string {
  if (raw.length <= 1) return raw;
  const chars = [...raw];
  let combined = chars[0] ?? "";
  for (let i = 1; i < chars.length; i++) {
    const next = chars[i];
    if (!next) continue;
    try {
      combined = combineVowels(combined, next) ?? combined + next;
    } catch {
      combined += next;
    }
  }
  return combined;
}

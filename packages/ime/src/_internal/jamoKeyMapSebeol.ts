/** 날개셋 세벌식: jamo → physical key by role (from fixtures/windows-chrome-ngs/ OS goldens only). */

export type PhysicalKey = { code: string; key: string; keyCode: number };

/** Choseong keys seen in continuous-hangul / backspace-mid / arrow-edit-mid / mixed-en-ko. */
const SEBEOL_CHOSEONG: Record<string, PhysicalKey> = {
  ㄱ: { code: "KeyK", key: "k", keyCode: 75 },
  ㄴ: { code: "KeyH", key: "h", keyCode: 72 },
  ㅅ: { code: "KeyN", key: "n", keyCode: 78 },
  ㅇ: { code: "KeyJ", key: "j", keyCode: 74 },
  ㅊ: { code: "KeyO", key: "o", keyCode: 79 },
  ㅌ: { code: "Quote", key: "'", keyCode: 222 },
  ㅎ: { code: "KeyM", key: "m", keyCode: 77 },
};

/** Jungseong keys from the same goldens (Digit8 = ㅢ compound, not ㅣ). */
const SEBEOL_JUNGSEONG: Record<string, PhysicalKey> = {
  ㅏ: { code: "KeyF", key: "f", keyCode: 70 },
  ㅐ: { code: "KeyT", key: "t", keyCode: 84 },
  ㅓ: { code: "KeyR", key: "r", keyCode: 82 },
  ㅕ: { code: "KeyE", key: "e", keyCode: 69 },
  ㅜ: { code: "KeyB", key: "b", keyCode: 66 },
  ㅣ: { code: "KeyD", key: "d", keyCode: 68 },
  ㅢ: { code: "Digit8", key: "8", keyCode: 56 },
};

/** Jongseong keys from the same goldens. */
const SEBEOL_JONGSEONG: Record<string, PhysicalKey> = {
  ㄴ: { code: "KeyS", key: "s", keyCode: 83 },
  ㄹ: { code: "KeyW", key: "w", keyCode: 87 },
  ㅁ: { code: "KeyZ", key: "z", keyCode: 90 },
  ㅇ: { code: "KeyA", key: "a", keyCode: 65 },
};

export type SebeolJamoRole = "choseong" | "jungseong" | "jongseong";

export function keyForSebeolJamo(jamo: string, role: SebeolJamoRole): PhysicalKey {
  const table =
    role === "choseong" ? SEBEOL_CHOSEONG : role === "jungseong" ? SEBEOL_JUNGSEONG : SEBEOL_JONGSEONG;
  const mapped = table[jamo];
  if (!mapped) {
    throw new Error(`No 세벌식-ngs ${role} key mapping for jamo: ${jamo}`);
  }
  return mapped;
}

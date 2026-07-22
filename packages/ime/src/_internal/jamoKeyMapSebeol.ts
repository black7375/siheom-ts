/**
 * 날개셋 세벌식 390: jamo → physical key by role.
 * Sources: fixtures/windows-chrome-ngs/* plus coverage captures
 * (가나다… / 개걔거… / 과괘괴…각갂간…).
 */

export type PhysicalKey = { code: string; key: string; keyCode: number };

/** Choseong (right hand). */
const SEBEOL_CHOSEONG: Record<string, PhysicalKey> = {
  ㄱ: { code: "KeyK", key: "k", keyCode: 75 },
  ㄴ: { code: "KeyH", key: "h", keyCode: 72 },
  ㄷ: { code: "KeyU", key: "u", keyCode: 85 },
  ㄹ: { code: "KeyY", key: "y", keyCode: 89 },
  ㅁ: { code: "KeyI", key: "i", keyCode: 73 },
  ㅂ: { code: "Semicolon", key: ";", keyCode: 186 },
  ㅅ: { code: "KeyN", key: "n", keyCode: 78 },
  ㅇ: { code: "KeyJ", key: "j", keyCode: 74 },
  ㅈ: { code: "KeyL", key: "l", keyCode: 76 },
  ㅊ: { code: "KeyO", key: "o", keyCode: 79 },
  ㅋ: { code: "Digit0", key: "0", keyCode: 48 },
  ㅌ: { code: "Quote", key: "'", keyCode: 222 },
  ㅍ: { code: "KeyP", key: "p", keyCode: 80 },
  ㅎ: { code: "KeyM", key: "m", keyCode: 77 },
};

/**
 * Atomic jungseong. ㅗ/ㅜ have a second physical key used as compound head
 * (Slash / Digit9) — see `keyForSebeolJamo` `compoundHead`.
 * ㅢ is a dedicated single key (Digit8); ㅑ is Digit6.
 */
const SEBEOL_JUNGSEONG: Record<string, PhysicalKey> = {
  ㅏ: { code: "KeyF", key: "f", keyCode: 70 },
  ㅐ: { code: "KeyT", key: "t", keyCode: 84 },
  ㅑ: { code: "Digit6", key: "6", keyCode: 54 },
  ㅒ: { code: "KeyT", key: "T", keyCode: 84 },
  ㅓ: { code: "KeyR", key: "r", keyCode: 82 },
  ㅔ: { code: "KeyC", key: "c", keyCode: 67 },
  ㅕ: { code: "KeyE", key: "e", keyCode: 69 },
  ㅗ: { code: "KeyV", key: "v", keyCode: 86 },
  ㅛ: { code: "Digit4", key: "4", keyCode: 52 },
  ㅜ: { code: "KeyB", key: "b", keyCode: 66 },
  ㅠ: { code: "Digit5", key: "5", keyCode: 53 },
  ㅡ: { code: "KeyG", key: "g", keyCode: 71 },
  ㅣ: { code: "KeyD", key: "d", keyCode: 68 },
  ㅢ: { code: "Digit8", key: "8", keyCode: 56 },
};

/** ㅗ/ㅜ when starting ㅘㅙㅚ / ㅝㅞㅟ (OS used Slash / Digit9, not KeyV / KeyB). */
const SEBEOL_JUNGSEONG_COMPOUND_HEAD: Record<string, PhysicalKey> = {
  ㅗ: { code: "Slash", key: "/", keyCode: 191 },
  ㅜ: { code: "Digit9", key: "9", keyCode: 57 },
};

/**
 * Compound jungseong typed as two atomic keys (except ㅢ = Digit8 alone).
 * Planner expands these into two preedit steps (고→과, …).
 */
export const SEBEOL_COMPOUND_JUNGSEONG_SEQ: Record<string, [string, string]> = {
  ㅘ: ["ㅗ", "ㅏ"],
  ㅙ: ["ㅗ", "ㅐ"],
  ㅚ: ["ㅗ", "ㅣ"],
  ㅝ: ["ㅜ", "ㅓ"],
  ㅞ: ["ㅜ", "ㅔ"],
  ㅟ: ["ㅜ", "ㅣ"],
};

/** Compound jongseong typed as two keys (값 = 갑→값). */
export const SEBEOL_COMPOUND_JONGSEONG_SEQ: Record<string, [string, string]> = {
  ㅄ: ["ㅂ", "ㅅ"],
  ㅂㅅ: ["ㅂ", "ㅅ"],
};

/** Jongseong (left hand). `ㅂㅅ` is es-hangul's form of ㅄ. */
const SEBEOL_JONGSEONG: Record<string, PhysicalKey> = {
  ㄱ: { code: "KeyX", key: "x", keyCode: 88 },
  ㄲ: { code: "KeyX", key: "X", keyCode: 88 },
  ㄴ: { code: "KeyS", key: "s", keyCode: 83 },
  ㄷ: { code: "Digit1", key: "1", keyCode: 49 },
  ㄹ: { code: "KeyW", key: "w", keyCode: 87 },
  ㅁ: { code: "KeyZ", key: "z", keyCode: 90 },
  ㅂ: { code: "Digit3", key: "3", keyCode: 51 },
  ㅅ: { code: "KeyQ", key: "q", keyCode: 81 },
  ㅄ: { code: "KeyQ", key: "q", keyCode: 81 },
  ㅂㅅ: { code: "KeyQ", key: "q", keyCode: 81 },
  ㅆ: { code: "Digit2", key: "2", keyCode: 50 },
  ㅇ: { code: "KeyA", key: "a", keyCode: 65 },
};

export type SebeolJamoRole = "choseong" | "jungseong" | "jongseong";

export function keyForSebeolJamo(
  jamo: string,
  role: SebeolJamoRole,
  options: { compoundHead?: boolean } = {},
): PhysicalKey {
  if (role === "jungseong" && options.compoundHead) {
    const head = SEBEOL_JUNGSEONG_COMPOUND_HEAD[jamo];
    if (head) return head;
  }

  const table =
    role === "choseong"
      ? SEBEOL_CHOSEONG
      : role === "jungseong"
        ? SEBEOL_JUNGSEONG
        : SEBEOL_JONGSEONG;
  const mapped = table[jamo];
  if (!mapped) {
    throw new Error(`No 세벌식-ngs ${role} key mapping for jamo: ${jamo}`);
  }
  return mapped;
}

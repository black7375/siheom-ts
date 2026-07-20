/** 두벌식: jamo → physical KeyboardEvent.code + default US key for that code */
export const JAMO_TO_KEY: Record<string, { code: string; key: string; keyCode: number }> = {
  ㄱ: { code: "KeyR", key: "r", keyCode: 82 },
  ㄲ: { code: "KeyR", key: "R", keyCode: 82 },
  ㄴ: { code: "KeyS", key: "s", keyCode: 83 },
  ㄷ: { code: "KeyE", key: "e", keyCode: 69 },
  ㄸ: { code: "KeyE", key: "E", keyCode: 69 },
  ㄹ: { code: "KeyF", key: "f", keyCode: 70 },
  ㅁ: { code: "KeyA", key: "a", keyCode: 65 },
  ㅂ: { code: "KeyQ", key: "q", keyCode: 81 },
  ㅃ: { code: "KeyQ", key: "Q", keyCode: 81 },
  ㅅ: { code: "KeyT", key: "t", keyCode: 84 },
  ㅆ: { code: "KeyT", key: "T", keyCode: 84 },
  ㅇ: { code: "KeyD", key: "d", keyCode: 68 },
  ㅈ: { code: "KeyW", key: "w", keyCode: 87 },
  ㅉ: { code: "KeyW", key: "W", keyCode: 87 },
  ㅊ: { code: "KeyC", key: "c", keyCode: 67 },
  ㅋ: { code: "KeyZ", key: "z", keyCode: 90 },
  ㅌ: { code: "KeyX", key: "x", keyCode: 88 },
  ㅍ: { code: "KeyV", key: "v", keyCode: 86 },
  ㅎ: { code: "KeyG", key: "g", keyCode: 71 },
  ㅏ: { code: "KeyK", key: "k", keyCode: 75 },
  ㅐ: { code: "KeyO", key: "o", keyCode: 79 },
  ㅑ: { code: "KeyI", key: "i", keyCode: 73 },
  ㅒ: { code: "KeyO", key: "O", keyCode: 79 },
  ㅓ: { code: "KeyJ", key: "j", keyCode: 74 },
  ㅔ: { code: "KeyP", key: "p", keyCode: 80 },
  ㅕ: { code: "KeyU", key: "u", keyCode: 85 },
  ㅖ: { code: "KeyP", key: "P", keyCode: 80 },
  ㅗ: { code: "KeyH", key: "h", keyCode: 72 },
  ㅛ: { code: "KeyY", key: "y", keyCode: 89 },
  ㅜ: { code: "KeyN", key: "n", keyCode: 78 },
  ㅠ: { code: "KeyB", key: "b", keyCode: 66 },
  ㅡ: { code: "KeyM", key: "m", keyCode: 77 },
  ㅣ: { code: "KeyL", key: "l", keyCode: 76 },
  // compound vowels / double consonants often typed as sequences; map common assembled forms
  ㅘ: { code: "KeyH", key: "h", keyCode: 72 },
  ㅙ: { code: "KeyH", key: "h", keyCode: 72 },
  ㅚ: { code: "KeyH", key: "h", keyCode: 72 },
  ㅝ: { code: "KeyN", key: "n", keyCode: 78 },
  ㅞ: { code: "KeyN", key: "n", keyCode: 78 },
  ㅟ: { code: "KeyN", key: "n", keyCode: 78 },
  ㅢ: { code: "KeyM", key: "m", keyCode: 77 },
  ㄳ: { code: "KeyR", key: "r", keyCode: 82 },
  ㄵ: { code: "KeyS", key: "s", keyCode: 83 },
  ㄶ: { code: "KeyS", key: "s", keyCode: 83 },
  ㄺ: { code: "KeyF", key: "f", keyCode: 70 },
  ㄻ: { code: "KeyF", key: "f", keyCode: 70 },
  ㄼ: { code: "KeyF", key: "f", keyCode: 70 },
  ㄽ: { code: "KeyF", key: "f", keyCode: 70 },
  ㄾ: { code: "KeyF", key: "f", keyCode: 70 },
  ㄿ: { code: "KeyF", key: "f", keyCode: 70 },
  ㅀ: { code: "KeyF", key: "f", keyCode: 70 },
  ㅄ: { code: "KeyQ", key: "q", keyCode: 81 },
};

export function keyForJamo(jamo: string): { code: string; key: string; keyCode: number } {
  const mapped = JAMO_TO_KEY[jamo];
  if (!mapped) {
    throw new Error(`No 2-beolsik key mapping for jamo: ${jamo}`);
  }
  return mapped;
}

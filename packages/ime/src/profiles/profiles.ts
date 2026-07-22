export type EnterDuringCompositionFacet =
  /** keydown (229 / isComposing) → compositionend; optional later real Enter */
  | "chromium"
  /** compositionend first → Enter with isComposing: false (Safari submit bug class) */
  | "webkit"
  /** keydown Process 229 → compositionend → keydown Enter (13) — Windows MS IME */
  | "chromium-duplicate"
  /** keydown Enter 229 → confirm update → compositionend → keyup Enter → keydown Enter — macOS Chrome Apple */
  | "chromium-apple";

/** Hangul keydown/keyup `key` field during composition (OS capture differs). */
export type HangulKeyEventKey = "process" | "jamo" | "unidentified";

/** How Hangul keystrokes are applied to the field. */
export type HangulComposeMode =
  /** compositionstart/update/end + insertCompositionText (Linux, Chrome) */
  | "composition"
  /** insertText / insertReplacementText without composition (Safari Apple) */
  | "replacement"
  /** composition with input before keydown (Safari Apple delayed-update fixed) */
  | "safari-composition"
  /** Firefox contenteditable broken: premature end after first jamo, then jamo-chain preedit */
  | "contenteditable-firefox-broken"
  /** Firefox contenteditable fixed: syllable-boundary commits with deferred compositionend */
  | "contenteditable-firefox-fixed"
  /** AF post-fix v2 golden replay (Lexical plugin on; visible 가나다 on plain input) */
  | "contenteditable-firefox-af-fixed"
  /** Slate #5989 — premature compositionend on first syllable (Android Chrome + placeholder) */
  | "android-chrome-slate-placeholder-broken"
  /** Plain textarea control baseline for Slate capture (Android Chrome) */
  | "android-chrome-slate-plain-control"
  /** AF Slate + placeholder — value stuck at ㄱ while preedit says 가 */
  | "android-firefox-slate-placeholder-broken"
  /** AF plain textarea control baseline */
  | "android-firefox-slate-plain-control"
  /** AF Slate fixed plugin device golden — continuous 가나다 preedit dup */
  | "android-firefox-slate-placeholder-fixed"
  /** Desktop Linux Chrome — Slate #5989 does not reproduce; placeholder → 가 */
  | "linux-chrome-slate-placeholder-fixed"
  | "linux-chrome-slate-plain-control"
  /** Desktop Linux Firefox — Slate placeholder → 가 (deferred input) */
  | "linux-firefox-slate-placeholder-fixed"
  | "linux-firefox-slate-plain-control";

/**
 * How Hangul→Hanja candidate conversion applies the chosen Hanja to the field.
 * - `replace` — Safari / typical Chromium: Hangul preedit becomes Hanja in place
 * - `append` — macOS Chrome Apple: Hanja appends after Hangul (김金); apps may strip
 */
export type HanjaConversionMode = "replace" | "append";

/**
 * When compositionend fires during multi-syllable Hangul typing.
 * - `syllable` — desktop IMEs: commit each syllable (김|태|희)
 * - `run` — Android Chrome virtual keyboard: one composition for the whole run
 */
export type HangulCompositionBoundary = "syllable" | "run";

/**
 * Physical Hangul keyboard layout for key `code` / mid-preedit planning.
 * - `dubeolsik` — 2-set (MS Hangul, ibus, Apple, …)
 * - `sebeolsik-ngs` — 날개셋 세벌식 (choseong/jungseong/jongseong on distinct keys)
 */
export type HangulKeyboardLayout = "dubeolsik" | "sebeolsik-ngs";

export type ImeProfile = {
  id: string;
  enterDuringComposition: EnterDuringCompositionFacet;
  hangulKeyEventKey: HangulKeyEventKey;
  hangulComposeMode: HangulComposeMode;
  hanjaConversion: HanjaConversionMode;
  hangulCompositionBoundary: HangulCompositionBoundary;
  hangulKeyboard: HangulKeyboardLayout;
  /** Windows Firefox: emit insertCompositionText `input` after compositionend. */
  postCompositionEndInput: boolean;
};

export const DEFAULT_IME_PROFILE_ID = "linux-chrome-ibus-hangul";

const registry = new Map<string, ImeProfile>();

type ProfileRegistration = Omit<ImeProfile, "hangulKeyboard" | "postCompositionEndInput"> &
  Partial<Pick<ImeProfile, "hangulKeyboard" | "postCompositionEndInput">>;

export function registerProfile(profile: ProfileRegistration): void {
  registry.set(profile.id, {
    hangulKeyboard: "dubeolsik",
    postCompositionEndInput: false,
    ...profile,
  });
}

function envProfileId(): string | undefined {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.SIHEOM_IME_PROFILE;
}

export function resolveProfile(idOrProfile?: string | ImeProfile): ImeProfile {
  if (idOrProfile && typeof idOrProfile !== "string") {
    return idOrProfile;
  }

  const id = idOrProfile ?? envProfileId() ?? DEFAULT_IME_PROFILE_ID;

  const found = registry.get(id);
  if (!found) {
    throw new Error(`Unknown IME profile: ${id}`);
  }
  return found;
}

export function getRegisteredProfileIds(): string[] {
  return [...registry.keys()];
}

function registerSyllableProfile(
  profile: Omit<ProfileRegistration, "hangulCompositionBoundary">,
): void {
  registerProfile({ ...profile, hangulCompositionBoundary: "syllable" });
}

function registerBuiltins() {
  // Linux Chrome + ibus-hangul Enter-confirm is compositionend → Enter(isComposing:false),
  // same order as Safari (OS capture in enter-submit/fixtures/linux-ibus-hangul-chrome/).
  registerSyllableProfile({
    id: "linux-chrome-ibus-hangul",
    enterDuringComposition: "webkit",
    hangulKeyEventKey: "process",
    hangulComposeMode: "composition",
    hanjaConversion: "replace",
  });
  registerSyllableProfile({
    id: "macos-safari",
    enterDuringComposition: "webkit",
    hangulKeyEventKey: "process",
    hangulComposeMode: "composition",
    hanjaConversion: "replace",
  });
  registerSyllableProfile({
    id: "macos-safari-apple",
    enterDuringComposition: "webkit",
    hangulKeyEventKey: "jamo",
    hangulComposeMode: "replacement",
    hanjaConversion: "replace",
  });
  registerSyllableProfile({
    id: "macos-chrome-apple",
    enterDuringComposition: "chromium-apple",
    hangulKeyEventKey: "jamo",
    hangulComposeMode: "composition",
    hanjaConversion: "append",
  });
  registerSyllableProfile({
    id: "windows-chrome-ms",
    enterDuringComposition: "chromium-duplicate",
    hangulKeyEventKey: "process",
    hangulComposeMode: "composition",
    hanjaConversion: "replace",
  });
  // 날개셋(Ngs) on Windows Chrome: same Enter facet as MS Hangul (Process 229 → end → Enter 13).
  // 세벌식: distinct choseong/jungseong/jongseong keys; no 2-set batchim look-ahead across syllables.
  registerSyllableProfile({
    id: "windows-chrome-ngs",
    enterDuringComposition: "chromium-duplicate",
    hangulKeyEventKey: "process",
    hangulComposeMode: "composition",
    hanjaConversion: "replace",
    hangulKeyboard: "sebeolsik-ngs",
  });
  // Windows Firefox + MS Hangul: compositionend then Enter (webkit order); no Process-Enter 229.
  // Extra insertCompositionText `input` after each compositionend (isComposing: false).
  registerSyllableProfile({
    id: "windows-firefox-ms",
    enterDuringComposition: "webkit",
    hangulKeyEventKey: "process",
    hangulComposeMode: "composition",
    hanjaConversion: "replace",
    postCompositionEndInput: true,
  });
  registerSyllableProfile({
    id: "chromium-enter-229",
    enterDuringComposition: "chromium",
    hangulKeyEventKey: "process",
    hangulComposeMode: "composition",
    hanjaConversion: "replace",
  });
  registerSyllableProfile({
    id: "chromium-cdp",
    enterDuringComposition: "chromium",
    hangulKeyEventKey: "process",
    hangulComposeMode: "composition",
    hanjaConversion: "replace",
  });
  // Android Chrome Gboard: Unidentified/229 keys, one composition run for a Hangul string,
  // Enter after compositionend (webkit order). OS captures in ime-*/fixtures/android-chrome/.
  // N/A (not modeled): ArrowLeft mid-edit (virtual keyboard has no arrows — capture uses
  // caret/tap edits); Alt+Enter Hanja (candidate-tap replace; broken≈fixed on captures).
  registerProfile({
    id: "android-chrome",
    enterDuringComposition: "webkit",
    hangulKeyEventKey: "unidentified",
    hangulComposeMode: "composition",
    hanjaConversion: "replace",
    hangulCompositionBoundary: "run",
  });
  registerSyllableProfile({
    id: "android-firefox-contenteditable-broken",
    enterDuringComposition: "webkit",
    hangulKeyEventKey: "process",
    hangulComposeMode: "contenteditable-firefox-broken",
    hanjaConversion: "replace",
  });
  registerSyllableProfile({
    id: "linux-firefox-contenteditable-fixed",
    enterDuringComposition: "webkit",
    hangulKeyEventKey: "process",
    hangulComposeMode: "contenteditable-firefox-fixed",
    hanjaConversion: "replace",
  });
  registerSyllableProfile({
    id: "android-firefox-contenteditable-fixed",
    enterDuringComposition: "webkit",
    hangulKeyEventKey: "process",
    hangulComposeMode: "contenteditable-firefox-af-fixed",
    hanjaConversion: "replace",
  });
  registerProfile({
    id: "android-chrome-slate-placeholder-broken",
    enterDuringComposition: "webkit",
    hangulKeyEventKey: "unidentified",
    hangulComposeMode: "android-chrome-slate-placeholder-broken",
    hanjaConversion: "replace",
    hangulCompositionBoundary: "run",
  });
  registerProfile({
    id: "android-chrome-slate-plain-control",
    enterDuringComposition: "webkit",
    hangulKeyEventKey: "unidentified",
    hangulComposeMode: "android-chrome-slate-plain-control",
    hanjaConversion: "replace",
    hangulCompositionBoundary: "run",
  });
  registerProfile({
    id: "android-firefox-slate-placeholder-broken",
    enterDuringComposition: "webkit",
    hangulKeyEventKey: "process",
    hangulComposeMode: "android-firefox-slate-placeholder-broken",
    hanjaConversion: "replace",
    hangulCompositionBoundary: "run",
  });
  registerProfile({
    id: "android-firefox-slate-plain-control",
    enterDuringComposition: "webkit",
    hangulKeyEventKey: "process",
    hangulComposeMode: "android-firefox-slate-plain-control",
    hanjaConversion: "replace",
    hangulCompositionBoundary: "run",
  });
  registerProfile({
    id: "android-firefox-slate-placeholder-fixed",
    enterDuringComposition: "webkit",
    hangulKeyEventKey: "process",
    hangulComposeMode: "android-firefox-slate-placeholder-fixed",
    hanjaConversion: "replace",
    hangulCompositionBoundary: "run",
  });
  registerSyllableProfile({
    id: "linux-chrome-slate-placeholder-fixed",
    enterDuringComposition: "webkit",
    hangulKeyEventKey: "process",
    hangulComposeMode: "linux-chrome-slate-placeholder-fixed",
    hanjaConversion: "replace",
  });
  registerSyllableProfile({
    id: "linux-chrome-slate-plain-control",
    enterDuringComposition: "webkit",
    hangulKeyEventKey: "process",
    hangulComposeMode: "linux-chrome-slate-plain-control",
    hanjaConversion: "replace",
  });
  registerSyllableProfile({
    id: "linux-firefox-slate-placeholder-fixed",
    enterDuringComposition: "webkit",
    hangulKeyEventKey: "process",
    hangulComposeMode: "linux-firefox-slate-placeholder-fixed",
    hanjaConversion: "replace",
  });
  registerSyllableProfile({
    id: "linux-firefox-slate-plain-control",
    enterDuringComposition: "webkit",
    hangulKeyEventKey: "process",
    hangulComposeMode: "linux-firefox-slate-plain-control",
    hanjaConversion: "replace",
  });
}

registerBuiltins();

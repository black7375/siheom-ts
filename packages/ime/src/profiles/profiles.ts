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
  | "safari-composition";

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

export type ImeProfile = {
  id: string;
  enterDuringComposition: EnterDuringCompositionFacet;
  hangulKeyEventKey: HangulKeyEventKey;
  hangulComposeMode: HangulComposeMode;
  hanjaConversion: HanjaConversionMode;
  hangulCompositionBoundary: HangulCompositionBoundary;
};

export const DEFAULT_IME_PROFILE_ID = "linux-chrome-ibus-hangul";

const registry = new Map<string, ImeProfile>();

export function registerProfile(profile: ImeProfile): void {
  registry.set(profile.id, profile);
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
  profile: Omit<ImeProfile, "hangulCompositionBoundary">,
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
  registerProfile({
    id: "android-chrome",
    enterDuringComposition: "webkit",
    hangulKeyEventKey: "unidentified",
    hangulComposeMode: "composition",
    hanjaConversion: "replace",
    hangulCompositionBoundary: "run",
  });
}

registerBuiltins();

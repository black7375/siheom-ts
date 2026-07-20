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
export type HangulKeyEventKey = "process" | "jamo";

/** How Hangul keystrokes are applied to the field. */
export type HangulComposeMode =
  /** compositionstart/update/end + insertCompositionText (Linux, Chrome) */
  | "composition"
  /** insertText / insertReplacementText without composition (Safari Apple) */
  | "replacement"
  /** composition with input before keydown (Safari Apple delayed-update fixed) */
  | "safari-composition";

export type ImeProfile = {
  id: string;
  enterDuringComposition: EnterDuringCompositionFacet;
  hangulKeyEventKey: HangulKeyEventKey;
  hangulComposeMode: HangulComposeMode;
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

function registerBuiltins() {
  // Linux Chrome + ibus-hangul Enter-confirm is compositionend → Enter(isComposing:false),
  // same order as Safari (OS capture in enter-submit/fixtures/linux-ibus-hangul-chrome/).
  registerProfile({
    id: "linux-chrome-ibus-hangul",
    enterDuringComposition: "webkit",
    hangulKeyEventKey: "process",
    hangulComposeMode: "composition",
  });
  registerProfile({
    id: "macos-safari",
    enterDuringComposition: "webkit",
    hangulKeyEventKey: "process",
    hangulComposeMode: "composition",
  });
  registerProfile({
    id: "macos-safari-apple",
    enterDuringComposition: "webkit",
    hangulKeyEventKey: "jamo",
    hangulComposeMode: "replacement",
  });
  registerProfile({
    id: "macos-chrome-apple",
    enterDuringComposition: "chromium-apple",
    hangulKeyEventKey: "jamo",
    hangulComposeMode: "composition",
  });
  registerProfile({
    id: "windows-chrome-ms",
    enterDuringComposition: "chromium-duplicate",
    hangulKeyEventKey: "process",
    hangulComposeMode: "composition",
  });
  registerProfile({
    id: "chromium-enter-229",
    enterDuringComposition: "chromium",
    hangulKeyEventKey: "process",
    hangulComposeMode: "composition",
  });
  registerProfile({
    id: "chromium-cdp",
    enterDuringComposition: "chromium",
    hangulKeyEventKey: "process",
    hangulComposeMode: "composition",
  });
}

registerBuiltins();

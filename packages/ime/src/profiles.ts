export type EnterDuringCompositionFacet =
  /** keydown (229 / isComposing) → compositionend; optional later real Enter */
  | "chromium"
  /** compositionend first → Enter with isComposing: false (Safari submit bug class) */
  | "webkit"
  /** keydown 229 → compositionend → keydown Enter (13) */
  | "chromium-duplicate";

export type ImeProfile = {
  id: string;
  enterDuringComposition: EnterDuringCompositionFacet;
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
  // same order as Safari (OS capture in enter-submit/fixtures/linux-chrome-ibus-hangul/).
  registerProfile({
    id: "linux-chrome-ibus-hangul",
    enterDuringComposition: "webkit",
  });
  registerProfile({
    id: "macos-safari",
    enterDuringComposition: "webkit",
  });
  registerProfile({
    id: "windows-chrome-ms",
    enterDuringComposition: "chromium-duplicate",
  });
  // Classic Chromium-order Enter confirm (229 first) — keep for matrix / other IMEs
  registerProfile({
    id: "chromium-enter-229",
    enterDuringComposition: "chromium",
  });
}

registerBuiltins();

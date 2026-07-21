/** Natural fix alternatives — see docs/research/slate-placeholder-fix-alternatives.md */

export type SlatePlaceholderAlternative = "alt-a" | "alt-b" | "alt-c";

export type SlateLoggerFixMode = "broken" | SlatePlaceholderAlternative;

export function isImeProcessKey(event: Pick<KeyboardEvent, "key" | "keyCode">): boolean {
  return event.key === "Process" || event.keyCode === 229;
}

/** A — composition anchor: early placeholder hide + careful selection. */
export function usesCompositionAnchor(mode: SlateLoggerFixMode): boolean {
  return mode === "alt-a" || mode === "alt-c";
}

/** B — trust Android IM: skip force-render while composing. */
export function usesForceRenderGuard(mode: SlateLoggerFixMode): boolean {
  return mode === "alt-b" || mode === "alt-c";
}

/** B/C — hide official placeholder decoration while IS_COMPOSING (Android React lag). */
export function usesPlaceholderHideWhileComposing(mode: SlateLoggerFixMode): boolean {
  return mode === "alt-b" || mode === "alt-c";
}

export function scenarioIdForFixMode(mode: SlateLoggerFixMode): string {
  switch (mode) {
    case "alt-a":
      return "slate-ac-first-hangul-placeholder-alt-a";
    case "alt-b":
      return "slate-ac-first-hangul-placeholder-alt-b";
    case "alt-c":
      return "slate-ac-first-hangul-placeholder-alt-c";
    default:
      return "slate-ac-first-hangul-placeholder";
  }
}

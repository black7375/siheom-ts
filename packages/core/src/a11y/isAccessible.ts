import { isEffectivelyHidden } from "./elementSemantics.ts";

export function isInaccessible(el: Element): boolean {
  return isEffectivelyHidden(el);
}

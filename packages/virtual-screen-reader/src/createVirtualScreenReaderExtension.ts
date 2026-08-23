import { createScreenReaderGivens, type ScreenReaderGivens } from "./screenReaderGivens.ts";
import { createScreenReaderEffects, type ScreenReaderEffects } from "./screenReaderEffects.ts";
import {
  createScreenReaderAssertions,
  type ScreenReaderAssertions,
} from "./screenReaderAssertions.ts";

export type VirtualScreenReaderExtension = {
  givens: ScreenReaderGivens;
  effects: ScreenReaderEffects;
  assertions: ScreenReaderAssertions;
};

/**
 * Registries to pass to `extendSiheom` (or spread into a registry bundle).
 * Adds new keys only — no collisions with the default siheom registries.
 */
export function createVirtualScreenReaderExtension(): VirtualScreenReaderExtension {
  return {
    givens: createScreenReaderGivens(),
    effects: createScreenReaderEffects(),
    assertions: createScreenReaderAssertions(),
  };
}
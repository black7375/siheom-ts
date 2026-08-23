import {
  createDefaultActions,
  createDefaultAssertions,
  defaultEffects,
  extendSiheom,
} from "@siheom/core";
import { defaultGivens, reactEffects } from "@siheom/react";
import { createVirtualScreenReaderExtension } from "@siheom/virtual-screen-reader";

/**
 * React runtime + virtual screen reader registries.
 * Usage:
 *   const { runSiheom, actions, assertions, given, effect } = createVirtualScreenReaderSiheom();
 */
export function createVirtualScreenReaderSiheom() {
  return extendSiheom(
    {
      actions: createDefaultActions(),
      assertions: createDefaultAssertions(),
      givens: defaultGivens,
      effects: { ...defaultEffects, ...reactEffects },
    },
    createVirtualScreenReaderExtension(),
  );
}

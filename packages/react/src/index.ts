import { actions, assertions, createRunSiheom, effect, query, withFakeTimers } from "@siheom/core";
import { cleanupReactRoots, defaultGivens, given } from "./given.ts";
import { reactEffects } from "./effects.ts";
import { reactFakeTimerScope } from "./fakeTimerScope.ts";
import {
  createReactFakeTimerScopedRegistries,
  reactActions,
  reactAssertions,
} from "./reactRegistries.ts";

export const runSiheom = createRunSiheom({
  actions: reactActions,
  assertions: reactAssertions,
  givens: defaultGivens,
  effects: reactEffects,
  fakeTimerScope: reactFakeTimerScope,
  createFakeTimerScopedRegistries: createReactFakeTimerScopedRegistries,
});

export { actions, assertions, query, given, effect, withFakeTimers };
export { defaultGivens, cleanupReactRoots, reactEffects, reactFakeTimerScope };

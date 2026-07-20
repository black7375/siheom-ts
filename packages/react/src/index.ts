import {
  actions,
  assertions,
  createRunSiheom,
  defaultAssertions,
  effect,
  query,
  withFakeTimers,
} from "@siheom/core";
import { cleanupReactRoots, defaultGivens, given } from "./given.ts";
import { reactEffects } from "./effects.ts";
import { reactFakeTimerScope } from "./fakeTimerScope.ts";
import { createReactFakeTimerScopedRegistries, reactActions } from "./reactRegistries.ts";

export const runSiheom = createRunSiheom({
  actions: reactActions,
  assertions: defaultAssertions,
  givens: defaultGivens,
  effects: reactEffects,
  fakeTimerScope: reactFakeTimerScope,
  createFakeTimerScopedRegistries: createReactFakeTimerScopedRegistries,
});

export { actions, assertions, query, given, effect, withFakeTimers };
export { defaultGivens, cleanupReactRoots, reactEffects, reactFakeTimerScope };

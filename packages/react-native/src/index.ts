import { createRunSiheom } from "../../core/src/siheom.ts";
import { effect } from "../../core/src/effect.ts";
import { withFakeTimers } from "../../core/src/withFakeTimers.ts";
import { cleanupReactRoots, defaultGivens, given } from "./given.ts";
import { reactNativeEffects } from "./effects.ts";
import { reactNativeFakeTimerScope } from "./fakeTimerScope.ts";
import { getFailureSnapshot } from "./getA11ySnapshot.ts";
import { query } from "./queryBuilders.ts";
import {
  createReactNativeFakeTimerScopedRegistries,
  reactNativeActions,
  reactNativeAssertions,
} from "./reactRegistries.ts";
import { actions, assertions } from "./stepBuilders.ts";

export const runSiheom = createRunSiheom({
  actions: reactNativeActions,
  assertions: reactNativeAssertions,
  givens: defaultGivens,
  effects: reactNativeEffects,
  fakeTimerScope: reactNativeFakeTimerScope,
  createFakeTimerScopedRegistries: createReactNativeFakeTimerScopedRegistries,
  getFailureSnapshot,
});

export { actions, assertions, query, given, effect, withFakeTimers };
export { cleanupReactRoots, defaultGivens, reactNativeEffects, reactNativeFakeTimerScope };

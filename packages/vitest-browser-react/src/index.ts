import { createRunSiheom, effect, withFakeTimers } from "@siheom/core";
import { actions, defaultBrowserActions } from "./action.ts";
import { assertions, defaultBrowserAssertions } from "./assert.ts";
import { cleanupReactRoots, defaultGivens, given } from "./given.ts";
import { reactEffects } from "./effects.ts";
import { reactFakeTimerScope } from "./fakeTimerScope.ts";
import { createBrowserFakeTimerScopedRegistries } from "./fakeTimerRegistries.ts";
import { query } from "./query.ts";

export const runSiheom = createRunSiheom({
  actions: defaultBrowserActions,
  assertions: defaultBrowserAssertions,
  givens: defaultGivens,
  effects: reactEffects,
  fakeTimerScope: reactFakeTimerScope,
  createFakeTimerScopedRegistries: createBrowserFakeTimerScopedRegistries,
});

export { actions, assertions, query, given, effect, withFakeTimers };
export { cleanupReactRoots, defaultGivens, reactEffects, reactFakeTimerScope };

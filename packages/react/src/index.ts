import {
  actions,
  assertions,
  createRunSiheom,
  defaultActions,
  defaultAssertions,
  effect,
  query,
  withFakeTimers,
} from "@siheom/core";
import { defaultGivens, given } from "./given.ts";
import { reactEffects } from "./effects.ts";
import { reactFakeTimerScope } from "./fakeTimerScope.ts";

export const runSiheom = createRunSiheom({
  actions: defaultActions,
  assertions: defaultAssertions,
  givens: defaultGivens,
  effects: reactEffects,
  fakeTimerScope: reactFakeTimerScope,
});

export { actions, assertions, query, given, effect, withFakeTimers };
export { defaultGivens, reactEffects, reactFakeTimerScope };

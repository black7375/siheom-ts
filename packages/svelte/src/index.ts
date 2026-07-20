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
import { svelteEffects } from "./effects.ts";
import { svelteFakeTimerScope } from "./fakeTimerScope.ts";

export const runSiheom = createRunSiheom({
  actions: defaultActions,
  assertions: defaultAssertions,
  givens: defaultGivens,
  effects: svelteEffects,
  fakeTimerScope: svelteFakeTimerScope,
});

export { actions, assertions, query, given, effect, withFakeTimers };
export { defaultGivens, svelteEffects, svelteFakeTimerScope };

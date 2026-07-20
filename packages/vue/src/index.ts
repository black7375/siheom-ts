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
import { vueEffects } from "./effects.ts";
import { vueFakeTimerScope } from "./fakeTimerScope.ts";

export const runSiheom = createRunSiheom({
  actions: defaultActions,
  assertions: defaultAssertions,
  givens: defaultGivens,
  effects: vueEffects,
  fakeTimerScope: vueFakeTimerScope,
});

export { actions, assertions, query, given, effect, withFakeTimers };
export { defaultGivens, vueEffects, vueFakeTimerScope };

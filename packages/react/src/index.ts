import {
  actions,
  assertions,
  createRunSiheom,
  defaultActions,
  defaultAssertions,
  defaultEffects,
  effect,
  query,
  withFakeTimers,
} from "@siheom/core";
import { defaultGivens, given } from "./given.ts";

export const runSiheom = createRunSiheom({
  actions: defaultActions,
  assertions: defaultAssertions,
  givens: defaultGivens,
  effects: defaultEffects,
});

export { actions, assertions, query, given, effect, withFakeTimers };
export { defaultGivens };

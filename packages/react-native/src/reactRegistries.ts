import type {
  ActionStepDefinitionDict,
  AssertionStepDefinitionDict,
  EffectStepDefinitionDict,
  GivenStepDefinitionDict,
} from "@siheom/core";
import { createDefaultActions } from "./action.ts";
import { createDefaultAssertions } from "./assert.ts";
import {
  createFakeTimerScopedRegistries,
  type SiheomRegistryBundle,
} from "./fakeTimerRegistries.ts";

export const reactNativeActions = createDefaultActions() as ActionStepDefinitionDict;
export const reactNativeAssertions = createDefaultAssertions() as AssertionStepDefinitionDict;

export function createReactNativeFakeTimerScopedRegistries<
  TActions extends ActionStepDefinitionDict,
  TAssertions extends AssertionStepDefinitionDict,
  TGivens extends GivenStepDefinitionDict,
  TEffects extends EffectStepDefinitionDict,
>(
  registries: SiheomRegistryBundle<TActions, TAssertions, TGivens, TEffects>,
): SiheomRegistryBundle<TActions, TAssertions, TGivens, TEffects> {
  return createFakeTimerScopedRegistries(registries);
}

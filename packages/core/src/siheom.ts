import { vi } from "vitest";
import type {
  ActionStepDefinitionDict,
  AssertionStepDefinitionDict,
  EffectStepDefinitionDict,
  FakeTimersScopeStep,
  GivenStepDefinitionDict,
  Locator,
  Step,
} from "./types";
import { getA11ySnapshot } from "./getA11ySnapshot";
import { formatFailureReport, type MessageMap } from "./messages.ts";
import { createFakeTimerScopedRegistries, type FakeTimerScopeHooks } from "./fakeTimerScope.ts";

export type SiheomRegistries<
  TActions extends ActionStepDefinitionDict = ActionStepDefinitionDict,
  TAssertions extends AssertionStepDefinitionDict = AssertionStepDefinitionDict,
  TGivens extends GivenStepDefinitionDict = GivenStepDefinitionDict,
  TEffects extends EffectStepDefinitionDict = EffectStepDefinitionDict,
> = {
  actions: TActions;
  assertions: TAssertions;
  givens: TGivens;
  effects: TEffects;
  messages?: MessageMap;
  fakeTimerScope?: FakeTimerScopeHooks;
};

async function runSteps<
  TActions extends ActionStepDefinitionDict,
  TAssertions extends AssertionStepDefinitionDict,
  TGivens extends GivenStepDefinitionDict,
  TEffects extends EffectStepDefinitionDict,
>(
  registries: SiheomRegistries<TActions, TAssertions, TGivens, TEffects>,
  steps: Step<TActions, TAssertions, TGivens, TEffects>[],
  logs: string[],
) {
  const handleError = (error: Error) => {
    throw new Error(
      formatFailureReport(logs, error, getA11ySnapshot(document.body), registries.messages),
    );
  };

  for (const step of steps) {
    if ("scope" in step) {
      await runFakeTimersScope(step, registries, logs);
      continue;
    }

    if ("action" in step) {
      const run = registries.actions[step.action] as ActionStepDefinitionDict[string];
      logs.push(step.log);
      await run(step.target, ...(step.args ?? [])).catch(handleError);
      continue;
    }

    if ("given" in step) {
      const run = registries.givens[step.given] as (...args: readonly unknown[]) => Promise<void>;
      logs.push(step.log);
      await run(...(step.args ?? [])).catch(handleError);
      continue;
    }

    if ("effect" in step) {
      const run = registries.effects[step.effect] as EffectStepDefinitionDict[string];
      logs.push(step.log);
      await run(...(step.args ?? [])).catch(handleError);
      continue;
    }

    if ("assert" in step) {
      const run = registries.assertions[step.assert] as (
        locator: Locator,
        ...args: readonly unknown[]
      ) => Promise<void>;
      logs.push(step.log);
      await run(step.target, ...(step.args ?? [])).catch(handleError);
      continue;
    }

    throw new Error("Invalid step");
  }
}

async function runFakeTimersScope<
  TActions extends ActionStepDefinitionDict,
  TAssertions extends AssertionStepDefinitionDict,
  TGivens extends GivenStepDefinitionDict,
  TEffects extends EffectStepDefinitionDict,
>(
  scope: FakeTimersScopeStep<TActions, TAssertions, TGivens, TEffects>,
  registries: SiheomRegistries<TActions, TAssertions, TGivens, TEffects>,
  logs: string[],
) {
  const installFakeTimers =
    registries.fakeTimerScope?.installFakeTimers ??
    (() => {
      vi.useFakeTimers({ shouldAdvanceTime: false });
    });
  installFakeTimers();
  try {
    const scopedRegistries = createFakeTimerScopedRegistries(registries);
    await runSteps(scopedRegistries, scope.steps.flat(), logs);
  } finally {
    vi.useRealTimers();
  }
}

export function createRunSiheom<
  TActions extends ActionStepDefinitionDict,
  TAssertions extends AssertionStepDefinitionDict,
  TGivens extends GivenStepDefinitionDict,
  TEffects extends EffectStepDefinitionDict,
>(registries: SiheomRegistries<TActions, TAssertions, TGivens, TEffects>) {
  return async function runSiheom(
    ...steps: (
      | Step<TActions, TAssertions, TGivens, TEffects>
      | Step<TActions, TAssertions, TGivens, TEffects>[]
    )[]
  ) {
    const logs: string[] = [];
    await runSteps(registries, steps.flat(), logs);
  };
}

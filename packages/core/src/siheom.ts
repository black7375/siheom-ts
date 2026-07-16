import type {
  ActionStepDefinitionDict,
  AssertionStepDefinitionDict,
  GivenStepDefinitionDict,
  Locator,
  Step,
} from "./types";
import { getA11ySnapshot } from "./getA11ySnapshot";
import { formatFailureReport, type MessageMap } from "./messages.ts";

export type SiheomRegistries<
  TActions extends ActionStepDefinitionDict = ActionStepDefinitionDict,
  TAssertions extends AssertionStepDefinitionDict = AssertionStepDefinitionDict,
  TGivens extends GivenStepDefinitionDict = GivenStepDefinitionDict,
> = {
  actions: TActions;
  assertions: TAssertions;
  givens: TGivens;
  messages?: MessageMap;
};

export function createRunSiheom<
  TActions extends ActionStepDefinitionDict,
  TAssertions extends AssertionStepDefinitionDict,
  TGivens extends GivenStepDefinitionDict,
>(registries: SiheomRegistries<TActions, TAssertions, TGivens>) {
  return async function runSiheom(
    ...steps: (Step<TActions, TAssertions, TGivens> | Step<TActions, TAssertions, TGivens>[])[]
  ) {
    const logs: string[] = [];

    const handleError = (error: Error) => {
      throw new Error(
        formatFailureReport(logs, error, getA11ySnapshot(document.body), registries.messages),
      );
    };

    for (const step of steps.flat()) {
      if ("action" in step) {
        const run = registries.actions[step.action] as ActionStepDefinitionDict[string];
        logs.push(step.log);
        await run(step.target, ...(step.args ?? [])).catch(handleError);
      } else if ("given" in step) {
        const run = registries.givens[step.given] as (...args: readonly unknown[]) => Promise<void>;
        logs.push(step.log);
        await run(...(step.args ?? [])).catch(handleError);
      } else if ("assert" in step) {
        const run = registries.assertions[step.assert] as (
          locator: Locator,
          ...args: readonly unknown[]
        ) => Promise<void>;
        logs.push(step.log);
        await run(step.target, ...(step.args ?? [])).catch(handleError);
      } else {
        throw new Error("Invalid step");
      }
    }
  };
}

import type {
	ActionStepDefinitionDict,
	AssertionStepDefinitionDict,
	GivenStepDefinitionDict,
	Locator,
	Step,
} from "./types";
import { defaultActions } from "./action";
import { getA11ySnapshot } from "./getA11ySnapshot";
import { defaultAssertions } from "./assert";

export type SiheomRegistries<
	TActions extends ActionStepDefinitionDict = ActionStepDefinitionDict,
	TAssertions extends AssertionStepDefinitionDict = AssertionStepDefinitionDict,
	TGivens extends GivenStepDefinitionDict = GivenStepDefinitionDict,
> = {
	actions: TActions;
	assertions: TAssertions;
	givens: TGivens;
};

export function createRunSiheom<
	TActions extends ActionStepDefinitionDict,
	TAssertions extends AssertionStepDefinitionDict,
	TGivens extends GivenStepDefinitionDict,
>(registries: SiheomRegistries<TActions, TAssertions, TGivens>) {
	return async function runSiheom(
		...steps: (
			| Step<TActions, TAssertions, TGivens>
			| Step<TActions, TAssertions, TGivens>[]
		)[]
	) {
		const logs: string[] = [];

		const handleError = (error: Error) => {
			const index = error.message.indexOf("Ignored node");
			const message = `[Logs]\n\n${logs.join("\n")}\n\n[Original Error Message]\n\n${error.message.slice(0, index === -1 ? undefined : index)}\n\n[A11y Snapshot]\n\n${getA11ySnapshot(document.body)}`;
			throw new Error(message);
		};

		for (const step of steps.flat()) {
			if ("action" in step) {
				const run = registries.actions[
					step.action
				] as ActionStepDefinitionDict[string];
				logs.push(step.log);
				await run(step.target, ...(step.args ?? [])).catch(handleError);
			} else if ("given" in step) {
				const run = registries.givens[step.given] as (
					...args: readonly unknown[]
				) => Promise<void>;
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

/** Core runner without framework givens (actions + assertions only). */
export const runSiheom = createRunSiheom({
	actions: defaultActions,
	assertions: defaultAssertions,
	givens: {} as GivenStepDefinitionDict,
});

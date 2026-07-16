import { createRunSiheom, type SiheomRegistries } from "./siheom.ts";
import { query, locatorLog } from "./query.ts";
import type { MessageMap } from "./messages.ts";
import type {
	ActionStepDefinitionDict,
	AssertionStepDefinitionDict,
	GivenStepDefinitionDict,
	Locator,
} from "./types.ts";

export type { MessageMap } from "./messages.ts";

export type SiheomFactoryRegistries<
	TActions extends ActionStepDefinitionDict = ActionStepDefinitionDict,
	TAssertions extends AssertionStepDefinitionDict = AssertionStepDefinitionDict,
	TGivens extends GivenStepDefinitionDict = GivenStepDefinitionDict,
> = SiheomRegistries<TActions, TAssertions, TGivens>;

type ActionBindings<TActions extends ActionStepDefinitionDict> = {
	[K in keyof TActions]: TActions[K] extends (
		target: Locator,
		...args: infer Args
	) => Promise<void>
		? (
				target: Locator,
				...args: Args
			) => {
				action: K & string;
				target: Locator;
				args?: Args;
				log: string;
			}
		: never;
};

type AssertionBindings<TAssertions extends AssertionStepDefinitionDict> = {
	[K in keyof TAssertions]: TAssertions[K] extends (
		target: Locator,
		...args: infer Args
	) => Promise<void>
		? (
				target: Locator,
				...args: Args
			) => {
				assert: K & string;
				target: Locator;
				args?: Args;
				log: string;
			}
		: never;
};

type GivenBindings<TGivens extends GivenStepDefinitionDict> = {
	[K in keyof TGivens]: TGivens[K] extends (
		...args: infer Args
	) => Promise<void>
		? (...args: Args) => {
				given: K & string;
				args?: Args;
				log: string;
			}
		: never;
};

export type SiheomBindings<
	TActions extends ActionStepDefinitionDict = ActionStepDefinitionDict,
	TAssertions extends AssertionStepDefinitionDict = AssertionStepDefinitionDict,
	TGivens extends GivenStepDefinitionDict = GivenStepDefinitionDict,
> = {
	runSiheom: ReturnType<typeof createRunSiheom<TActions, TAssertions, TGivens>>;
	actions: ActionBindings<TActions>;
	assertions: AssertionBindings<TAssertions>;
	given: GivenBindings<TGivens>;
	query: typeof query;
};

function assertNewKeysOnly(
	kind: string,
	baseKeys: string[],
	extensionKeys: string[],
) {
	const overlap = extensionKeys.filter((key) => baseKeys.includes(key));
	if (overlap.length > 0) {
		throw new Error(
			`extendSiheom: cannot add existing ${kind} keys: ${overlap.join(", ")}. Use overrideSiheom to replace.`,
		);
	}
}

function assertExistingKeysOnly(
	kind: string,
	baseKeys: string[],
	overrideKeys: string[],
) {
	const missing = overrideKeys.filter((key) => !baseKeys.includes(key));
	if (missing.length > 0) {
		throw new Error(
			`overrideSiheom: cannot replace unknown ${kind} keys: ${missing.join(", ")}. Use extendSiheom to add.`,
		);
	}
}

function buildActionBindings<TActions extends ActionStepDefinitionDict>(
	actions: TActions,
): ActionBindings<TActions> {
	const bindings = {} as ActionBindings<TActions>;
	for (const name of Object.keys(actions) as (keyof TActions & string)[]) {
		bindings[name] = ((target: Locator, ...args: unknown[]) => ({
			action: name,
			target,
			...(args.length > 0 ? { args } : {}),
			log: `${name}: ${locatorLog(target)}`,
		})) as ActionBindings<TActions>[typeof name];
	}
	return bindings;
}

function buildAssertionBindings<
	TAssertions extends AssertionStepDefinitionDict,
>(assertions: TAssertions): AssertionBindings<TAssertions> {
	const bindings = {} as AssertionBindings<TAssertions>;
	for (const name of Object.keys(assertions) as (keyof TAssertions &
		string)[]) {
		bindings[name] = ((target: Locator, ...args: unknown[]) => ({
			assert: name,
			target,
			...(args.length > 0 ? { args } : {}),
			log: `${name}: ${locatorLog(target)}`,
		})) as AssertionBindings<TAssertions>[typeof name];
	}
	return bindings;
}

function buildGivenBindings<TGivens extends GivenStepDefinitionDict>(
	givens: TGivens,
): GivenBindings<TGivens> {
	const bindings = {} as GivenBindings<TGivens>;
	for (const name of Object.keys(givens) as (keyof TGivens & string)[]) {
		bindings[name] = ((...args: unknown[]) => ({
			given: name,
			...(args.length > 0 ? { args } : {}),
			log: `${name}`,
		})) as GivenBindings<TGivens>[typeof name];
	}
	return bindings;
}

function toBindings<
	TActions extends ActionStepDefinitionDict,
	TAssertions extends AssertionStepDefinitionDict,
	TGivens extends GivenStepDefinitionDict,
>(
	registries: SiheomFactoryRegistries<TActions, TAssertions, TGivens>,
): SiheomBindings<TActions, TAssertions, TGivens> {
	return {
		runSiheom: createRunSiheom(registries),
		actions: buildActionBindings(registries.actions),
		assertions: buildAssertionBindings(registries.assertions),
		given: buildGivenBindings(registries.givens),
		query,
	};
}

export function extendSiheom<
	TActions extends ActionStepDefinitionDict,
	TAssertions extends AssertionStepDefinitionDict,
	TGivens extends GivenStepDefinitionDict,
	TNewActions extends ActionStepDefinitionDict = Record<string, never>,
	TNewAssertions extends AssertionStepDefinitionDict = Record<string, never>,
	TNewGivens extends GivenStepDefinitionDict = Record<string, never>,
>(
	base: SiheomFactoryRegistries<TActions, TAssertions, TGivens>,
	extension: {
		actions?: TNewActions;
		assertions?: TNewAssertions;
		givens?: TNewGivens;
		messages?: MessageMap;
	},
): SiheomBindings<
	TActions & TNewActions,
	TAssertions & TNewAssertions,
	TGivens & TNewGivens
> {
	const newActions = extension.actions ?? ({} as TNewActions);
	const newAssertions = extension.assertions ?? ({} as TNewAssertions);
	const newGivens = extension.givens ?? ({} as TNewGivens);

	assertNewKeysOnly(
		"action",
		Object.keys(base.actions),
		Object.keys(newActions),
	);
	assertNewKeysOnly(
		"assertion",
		Object.keys(base.assertions),
		Object.keys(newAssertions),
	);
	assertNewKeysOnly("given", Object.keys(base.givens), Object.keys(newGivens));

	return toBindings({
		actions: { ...base.actions, ...newActions },
		assertions: { ...base.assertions, ...newAssertions },
		givens: { ...base.givens, ...newGivens },
		messages: { ...base.messages, ...extension.messages },
	});
}

export function overrideSiheom<
	TActions extends ActionStepDefinitionDict,
	TAssertions extends AssertionStepDefinitionDict,
	TGivens extends GivenStepDefinitionDict,
>(
	base: SiheomFactoryRegistries<TActions, TAssertions, TGivens>,
	overrides: {
		actions?: Partial<TActions>;
		assertions?: Partial<TAssertions>;
		givens?: Partial<TGivens>;
		messages?: MessageMap;
	},
): SiheomBindings<TActions, TAssertions, TGivens> {
	const actionOverrides = overrides.actions ?? {};
	const assertionOverrides = overrides.assertions ?? {};
	const givenOverrides = overrides.givens ?? {};

	assertExistingKeysOnly(
		"action",
		Object.keys(base.actions),
		Object.keys(actionOverrides),
	);
	assertExistingKeysOnly(
		"assertion",
		Object.keys(base.assertions),
		Object.keys(assertionOverrides),
	);
	assertExistingKeysOnly(
		"given",
		Object.keys(base.givens),
		Object.keys(givenOverrides),
	);

	return toBindings({
		actions: { ...base.actions, ...actionOverrides },
		assertions: { ...base.assertions, ...assertionOverrides },
		givens: { ...base.givens, ...givenOverrides },
		messages: { ...base.messages, ...overrides.messages },
	});
}

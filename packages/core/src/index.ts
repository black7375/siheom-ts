export { createRunSiheom } from "./siheom.ts";
export type { SiheomRegistries } from "./siheom.ts";
export {
	defaultMessageMap,
	formatFailureReport,
	resolveMessageMap,
} from "./messages.ts";
export type { MessageMap } from "./messages.ts";
export { extendSiheom, overrideSiheom } from "./factory.ts";
export type { SiheomBindings, SiheomFactoryRegistries } from "./factory.ts";
export { query } from "./query.ts";
export { assertions, defaultAssertions } from "./assert.ts";
export { actions, defaultActions } from "./action.ts";
export type {
	ActionStep,
	ActionStepDefinitionDict,
	AssertionStep,
	AssertionStepDefinitionDict,
	GivenStep,
	GivenStepDefinitionDict,
	Locator,
	Step,
} from "./types.ts";

import { createRunSiheom } from "./siheom.ts";
import { defaultActions } from "./action.ts";
import { defaultAssertions } from "./assert.ts";
import type { GivenStepDefinitionDict } from "./types.ts";

/** Core runner without framework givens (actions + assertions only). */
export const runSiheom = createRunSiheom({
	actions: defaultActions,
	assertions: defaultAssertions,
	givens: {} as GivenStepDefinitionDict,
});

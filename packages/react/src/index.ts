import {
	actions,
	assertions,
	createRunSiheom,
	defaultActions,
	defaultAssertions,
	query,
} from "@siheom/core";
import { defaultGivens, given } from "./given.ts";

export const runSiheom = createRunSiheom({
	actions: defaultActions,
	assertions: defaultAssertions,
	givens: defaultGivens,
});

export { actions, assertions, query, given };
export { defaultGivens };

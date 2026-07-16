import { describe, expect, it } from "vitest";
import { extendSiheom, overrideSiheom } from "./factory.ts";
import type { Locator } from "./types.ts";

const target: Locator = { role: "button", name: "Go" };

const base = {
	actions: {
		click: async (_t: Locator) => {},
	},
	assertions: {
		visible: async (_t: Locator, _expected: boolean) => {},
	},
	givens: {
		render: async () => {},
	},
};

describe("extendSiheom", () => {
	it("adds a new action and returns bindings that run it", async () => {
	    let called: any = null;
		const selectAccount = async (locator: Locator, account: string) => {
			called = { locator, account };
		};

		const { runSiheom, actions, query } = extendSiheom(base, {
			actions: {
				selectAccount,
			},
		});

		await runSiheom(actions.selectAccount(target, "cash"));

		expect(called).toEqual({ locator: target, account: "cash" });
	});

	it("keeps base action bindings when adding a new action", async () => {
	    let called: any = null;
		const click = async (locator: Locator) => {
			called = locator;
		};
		const { runSiheom, actions } = extendSiheom(
			{ ...base, actions: { click } },
			{
				actions: {
					selectAccount: async () => {},
				},
			},
		);

		await runSiheom(actions.click(target));
		expect(called).toEqual(target);
	});

	it("rejects extending an existing action key", () => {
		expect(() =>
			extendSiheom(base, {
				actions: {
					click: async () => {},
				},
			}),
		).toThrow(/cannot add existing action keys: click/);
	});

	it("adds a new given and runs it", async () => {
	    let called: any = null;
		const withProviders = async (element: unknown) => {
			called = element;
		};

		const { runSiheom, given } = extendSiheom(base, {
			givens: {
				withProviders,
			},
		});

		await runSiheom(given.withProviders("app"));
		expect(called).toEqual("app");
	});
});

describe("overrideSiheom", () => {
	it("replaces an existing action implementation", async () => {
	    let called: any = null;
		const originalClick = async () => {
			called = "original";
		};
		const replacementClick = async () => {
			called = "replacement";
		};

		const { runSiheom, actions } = overrideSiheom(
			{
				...base,
				actions: {
					click: originalClick,
				},
			},
			{
				actions: {
					click: replacementClick,
				},
			},
		);

		await runSiheom(actions.click(target));

		expect(called).toEqual("replacement");
	});

	it("rejects overriding an unknown action key", () => {
		expect(() =>
			overrideSiheom(base, {
				actions: {
					selectAccount: async () => {},
				} as Partial<(typeof base)["actions"]> & {
					selectAccount: () => Promise<void>;
				},
			}),
		).toThrow(/cannot replace unknown action keys: selectAccount/);
	});
});

describe("message map", () => {
	it("uses custom failure-report headers from extendSiheom messages", async () => {
	
		const { runSiheom, actions } = extendSiheom(
			{
				...base,
				actions: {
					boom: async () => {
						throw new Error("boom");
					},
				},
			},
			{
				messages: {
					logs: "로그",
					originalErrorMessage: "원본 에러 메시지",
					a11ySnapshot: "접근성 스냅샷",
				},
			},
		);

		await expect(runSiheom(actions.boom(target))).rejects.toThrow(
			"[로그]\n\nboom: button \"Go\"\n\n[원본 에러 메시지]\n\nboom\n\n[접근성 스냅샷]\n\n",
		);
	});

	it("uses custom failure-report headers from overrideSiheom messages", async () => {
		const { runSiheom, actions } = overrideSiheom(
			{
				...base,
				actions: {
					click: async () => {
						throw new Error("boom");
					},
				},
			},
			{
				messages: {
					logs: "로그",
				},
			},
		);

		await expect(runSiheom(actions.click(target))).rejects.toThrow("[로그]\n\n");
	});
});

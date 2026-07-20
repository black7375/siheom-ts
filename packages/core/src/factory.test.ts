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
  effects: {
    elapsed: async (_ms: number) => {},
  },
};

describe("extendSiheom", () => {
  it("adds a new action and returns bindings that run it", async () => {
    let called: any = null;
    const selectAccount = async (locator: Locator, account: string) => {
      called = { locator, account };
    };

    const { runSiheom, actions } = extendSiheom(base, {
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

  it("adds a new effect and returns bindings that run it", async () => {
    let called: number | null = null;
    const pause = async (ms: number) => {
      called = ms;
    };

    const { runSiheom, effect: effectBindings } = extendSiheom(base, {
      effects: {
        pause,
      },
    });

    await runSiheom(effectBindings.pause(300));

    expect(called).toBe(300);
  });

  it("rejects extending an existing effect key", () => {
    expect(() =>
      extendSiheom(base, {
        effects: {
          elapsed: async () => {},
        },
      }),
    ).toThrow(/cannot add existing effect keys: elapsed/);
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

  it("replaces an existing effect implementation", async () => {
    let called: string | null = null;
    const replacementElapsed = async () => {
      called = "replacement";
    };

    const { runSiheom, effect: effectBindings } = overrideSiheom(base, {
      effects: {
        elapsed: replacementElapsed,
      },
    });

    await runSiheom(effectBindings.elapsed(1_000));

    expect(called).toBe("replacement");
  });

  it("rejects overriding an unknown effect key", () => {
    expect(() =>
      overrideSiheom(base, {
        effects: {
          pause: async () => {},
        } as Partial<(typeof base)["effects"]> & {
          pause: () => Promise<void>;
        },
      }),
    ).toThrow(/cannot replace unknown effect keys: pause/);
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
      '[로그]\n\nboom: button "Go"\n\n[원본 에러 메시지]\n\nboom\n\n[접근성 스냅샷]\n\n',
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

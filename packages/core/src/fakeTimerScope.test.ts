import { describe, expect, it } from "vitest";
import { wrapActionsAfterHook } from "./fakeTimerScope.ts";

describe("wrapActionsAfterHook", () => {
  it("runs the after hook once per action", async () => {
    let actionCalls = 0;
    let hookCalls = 0;

    const actions = wrapActionsAfterHook(
      {
        tap: async (_target) => {
          actionCalls += 1;
        },
      },
      async () => {
        hookCalls += 1;
      },
    );

    await actions.tap({ role: "button", name: "Go" });

    expect(actionCalls).toBe(1);
    expect(hookCalls).toBe(1);
  });
});

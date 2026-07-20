import { describe, expectTypeOf, it } from "vitest";
import { createDefaultActions, createDefaultAssertions, overrideSiheom, defaultEffects } from "./index.ts";

describe("overrideSiheom binding types", () => {
  it("keeps action and assertion bindings required", () => {
    const { actions, assertions, given } = overrideSiheom(
      {
        actions: createDefaultActions(),
        assertions: createDefaultAssertions(),
        givens: { render: async () => {} },
        effects: defaultEffects,
      },
      {},
    );

    expectTypeOf(actions.fill).toBeFunction();
    expectTypeOf(actions.click).toBeFunction();
    expectTypeOf(assertions.value).toBeFunction();
    expectTypeOf(given.render).toBeFunction();

    // Must not be optional
    expectTypeOf(actions.fill).not.toEqualTypeOf<undefined>();
    expectTypeOf(actions.fill!).parameters.toEqualTypeOf<
      [import("./types.ts").Locator, string]
    >();
  });
});

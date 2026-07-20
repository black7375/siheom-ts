import * as React from "react";
import { userEvent } from "@testing-library/user-event";
import {
  createDefaultActions,
  createDefaultAssertions,
  extendSiheom,
  getElement,
  type Locator,
} from "@siheom/core";
import {
  assertions,
  defaultGivens,
  given,
  query,
  reactEffects,
  reactFakeTimerScope,
} from "@siheom/react";

async function actAsync<T>(run: () => Promise<T> | T): Promise<T> {
  let result!: T;
  await React.act(async () => {
    result = await run();
  });
  await React.act(async () => {
    await new Promise<void>((resolve) => {
      queueMicrotask(resolve);
    });
  });
  return result;
}

function wrapInActAsync<T extends Record<string, (...args: never[]) => Promise<void>>>(
  impl: T,
): T {
  return Object.fromEntries(
    Object.entries(impl).map(([name, run]) => [
      name,
      (...args: Parameters<typeof run>) => actAsync(() => run(...args)),
    ]),
  ) as T;
}

const user = userEvent.setup();

async function contextClick(target: Locator) {
  const element = getElement(target, true);
  await user.pointer({ keys: "[MouseRight>]", target: element });
  await user.pointer({ keys: "[/MouseRight]" });
}

export const { runSiheom, actions } = extendSiheom(
  {
    actions: wrapInActAsync(createDefaultActions()),
    assertions: wrapInActAsync(createDefaultAssertions()),
    givens: defaultGivens,
    effects: reactEffects,
    fakeTimerScope: reactFakeTimerScope,
  },
  {
    actions: {
      contextClick: (target: Locator) => actAsync(() => contextClick(target)),
    },
  },
);

export { assertions, given, query };

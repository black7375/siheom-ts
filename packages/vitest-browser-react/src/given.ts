import { cleanup, render } from "vitest-browser-react";
import type { GivenStep } from "@siheom/core";
import type { ReactElement } from "react";

export async function cleanupReactRoots(): Promise<void> {
  await cleanup();
}

export const defaultGivens = {
  render: async (element: ReactElement) => {
    await render(element);
  },
};

export const given = {
  render: (element: ReactElement): GivenStep<typeof defaultGivens> => ({
    given: "render",
    log: "렌더한다",
    args: [element],
  }),
};

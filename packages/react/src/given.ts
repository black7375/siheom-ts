import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import type { GivenStep } from "@siheom/core";
import type { ReactElement } from "react";

const mountedRoots: { root: Root; container: HTMLDivElement }[] = [];

export async function cleanupReactRoots(): Promise<void> {
  while (mountedRoots.length > 0) {
    const { root, container } = mountedRoots.pop()!;
    await React.act(async () => {
      root.unmount();
    });
    container.remove();
  }
}

export const defaultGivens = {
  render: async (element: ReactElement) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    mountedRoots.push({ root, container });
    await React.act(async () => {
      root.render(element);
    });
  },
};

export const given = {
  render: (element: ReactElement): GivenStep<typeof defaultGivens> => ({
    given: "render",
    log: "렌더한다",
    args: [element],
  }),
};

import { act, render } from "@testing-library/svelte";
import type { GivenStep } from "@siheom/core";
import type { Component } from "svelte";

export const defaultGivens = {
  render: async (component: Component) => {
    await act(async () => {
      return render(component);
    });
  },
};

export const given = {
  render: (component: Component): GivenStep<typeof defaultGivens> => ({
    given: "render",
    log: "렌더한다",
    args: [component],
  }),
};

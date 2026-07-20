import { render } from "@testing-library/vue";
import type { GivenStep } from "@siheom/core";
import type { Component } from "vue";

export const defaultGivens = {
  render: async (component: Component) => {
    render(component);
  },
};

export const given = {
  render: (component: Component): GivenStep<typeof defaultGivens> => ({
    given: "render",
    log: "렌더한다",
    args: [component],
  }),
};

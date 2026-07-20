import { render } from "@noma.to/qwik-testing-library";
import type { GivenStep } from "@siheom/core";
import type { JSXOutput } from "@builder.io/qwik";

export const defaultGivens = {
  render: async (element: JSXOutput) => {
    await render(element);
  },
};

export const given = {
  render: (element: JSXOutput): GivenStep<typeof defaultGivens> => ({
    given: "render",
    log: "렌더한다",
    args: [element],
  }),
};

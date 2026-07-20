import { act, render } from "@testing-library/react";
import type { GivenStep } from "@siheom/core";
import type { ReactElement } from "react";

export const defaultGivens = {
  render: async (element: ReactElement) => {
    act(() => {
      render(element);
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

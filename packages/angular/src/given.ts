import { render } from "@testing-library/angular";
import type { ComponentFixture } from "@angular/core/testing";
import type { GivenStep } from "@siheom/core";
import type { Type } from "@angular/core";

let activeFixture: ComponentFixture<unknown> | undefined;

export function detectChanges() {
  activeFixture?.detectChanges();
}

export const defaultGivens = {
  render: async (component: Type<unknown>) => {
    const view = await render(component);
    activeFixture = view.fixture;
  },
};

export const given = {
  render: (component: Type<unknown>): GivenStep<typeof defaultGivens> => ({
    given: "render",
    log: "렌더한다",
    args: [component],
  }),
};

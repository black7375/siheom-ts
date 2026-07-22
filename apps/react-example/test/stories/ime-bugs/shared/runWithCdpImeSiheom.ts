import {
  createDefaultActions,
  createDefaultAssertions,
  defaultEffects,
  overrideSiheom,
} from "@siheom/core";
import { createCdpImeActions, type CreateCdpImeActionsOptions } from "@siheom/ime-cdp";
import { defaultGivens, reactEffects } from "@siheom/react";
import { render } from "@/stories/render";

export function runWithCdpImeSiheom(options: CreateCdpImeActionsOptions = {}) {
  return overrideSiheom(
    {
      actions: createDefaultActions(),
      assertions: createDefaultAssertions(),
      givens: defaultGivens,
      effects: { ...defaultEffects, ...reactEffects },
    },
    {
      actions: createCdpImeActions(options),
      givens: {
        render: async (element: React.ReactElement) => {
          await render(element);
        },
      },
    },
  );
}

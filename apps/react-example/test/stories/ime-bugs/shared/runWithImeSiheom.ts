import {
  createDefaultActions,
  createDefaultAssertions,
  defaultEffects,
  overrideSiheom,
} from "@siheom/core";
import { createImeActions, type CreateImeActionsOptions } from "@siheom/ime";
import { defaultGivens, reactEffects } from "@siheom/react";
import { render } from "@/stories/render";

export function runWithImeSiheom(options: CreateImeActionsOptions = {}) {
  return overrideSiheom(
    {
      actions: createDefaultActions(),
      assertions: createDefaultAssertions(),
      givens: defaultGivens,
      effects: { ...defaultEffects, ...reactEffects },
    },
    {
      actions: createImeActions(options),
      givens: {
        render: async (element: React.ReactElement) => {
          await render(element);
        },
      },
    },
  );
}

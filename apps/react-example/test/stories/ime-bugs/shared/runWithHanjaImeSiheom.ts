import {
  createDefaultActions,
  createDefaultAssertions,
  defaultEffects,
  extendSiheom,
} from "@siheom/core";
import { createImeActions, type CreateImeActionsOptions } from "@siheom/ime";
import { createHanjaActions } from "@siheom/ime/hanja";
import { defaultGivens, reactEffects } from "@siheom/react";
import { render } from "@testing-library/react";

/**
 * IME fill/type override + typeHanja extension for candidate-conversion fixtures.
 */
export function runWithHanjaImeSiheom(options: CreateImeActionsOptions = {}) {
  return extendSiheom(
    {
      actions: {
        ...createDefaultActions(),
        ...createImeActions(options),
      },
      assertions: createDefaultAssertions(),
      givens: {
        ...defaultGivens,
        render: async (element: React.ReactElement) => {
          render(element);
        },
      },
      effects: { ...defaultEffects, ...reactEffects },
    },
    {
      actions: createHanjaActions(options),
    },
  );
}

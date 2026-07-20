import { waitFor } from "@testing-library/dom";
import { userEvent, type UserEvent } from "@testing-library/user-event";
import { getElement, type ActionStepDefinitionDict, type Locator } from "@siheom/core";
import { expect } from "vitest";

import { composeHangul } from "./composeHangul";
import { segmentTypeText } from "./segmentTypeText";

export type CreateImeActionsOptions = {
  user?: UserEvent;
  resolveElement?: "sync" | "waitFor";
};

function isEditable(
  element: HTMLElement,
): element is HTMLInputElement | HTMLTextAreaElement {
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
}

async function typeImeText(
  user: UserEvent,
  element: HTMLElement,
  text: string,
): Promise<void> {
  if (!isEditable(element)) {
    await user.type(element, text);
    return;
  }

  for (const segment of segmentTypeText(text)) {
    if (segment.kind === "hangul") {
      await composeHangul(element, segment.text);
    } else {
      await user.keyboard(segment.text);
    }
  }
}

/**
 * Drop-in `fill` / `type` implementations for `overrideSiheom({ actions: createImeActions() })`.
 * Hangul runs use composition emulation; everything else uses `@testing-library/user-event`.
 */
export function createImeActions(
  options: CreateImeActionsOptions = {},
): Pick<ActionStepDefinitionDict, "fill" | "type"> {
  const user = options.user ?? userEvent.setup();
  const resolveElement = options.resolveElement ?? "waitFor";

  async function withPresentElement(
    target: Locator,
    run: (element: HTMLElement) => Promise<void>,
  ) {
    if (resolveElement === "sync") {
      const element = getElement(target, true);
      expect(element).toBeInTheDocument();
      await run(element);
      return;
    }

    await waitFor(async () => {
      const element = getElement(target, true);
      expect(element).toBeInTheDocument();
      await run(element);
    });
  }

  return {
    fill: async (target: Locator, text: string) =>
      withPresentElement(target, async (element) => {
        await user.click(element);
        await user.clear(element);
        await typeImeText(user, element, text);
      }),
    type: async (target: Locator, text: string) =>
      withPresentElement(target, async (element) => {
        await user.click(element);
        await typeImeText(user, element, text);
      }),
  };
}

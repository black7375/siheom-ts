import { waitFor } from "@testing-library/dom";
import { getElement, type ActionStepDefinitionDict, type Locator } from "@siheom/core";
import { segmentTypeText } from "@siheom/ime";
import { userEvent } from "vitest/browser";

import { composeHangulCdp, type ComposeHangulCdpOptions } from "../composeHangulCdp";
import type { CdpSend } from "../cdpSession";

export type CreateCdpImeActionsOptions = {
  resolveElement?: "sync" | "waitFor";
  session?: CdpSend;
  commitFinal?: ComposeHangulCdpOptions["commitFinal"];
};

function isEditable(element: HTMLElement): element is HTMLInputElement | HTMLTextAreaElement {
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
}

function assertInDocument(element: HTMLElement): void {
  if (!element.isConnected) {
    throw new Error("Expected locator target to resolve to an element in the document");
  }
}

async function typeImeText(
  element: HTMLElement,
  text: string,
  composeOptions: Pick<ComposeHangulCdpOptions, "session" | "commitFinal">,
): Promise<void> {
  if (!isEditable(element)) {
    await userEvent.type(element, text);
    return;
  }

  const segments = segmentTypeText(text);
  for (const segment of segments) {
    if (segment.kind === "hangul") {
      await composeHangulCdp(element, segment.text, composeOptions);
    } else {
      await userEvent.keyboard(segment.text);
    }
  }
}

/**
 * Drop-in `fill` / `type` for `overrideSiheom({ actions: createCdpImeActions() })`.
 * Hangul runs use Chromium CDP composition; everything else uses Vitest browser `userEvent`.
 */
export function createCdpImeActions(options: CreateCdpImeActionsOptions = {}) {
  const resolveElement = options.resolveElement ?? "waitFor";
  const composeOptions = {
    session: options.session,
    commitFinal: options.commitFinal,
  };

  async function withPresentElement(target: Locator, run: (element: HTMLElement) => Promise<void>) {
    if (resolveElement === "sync") {
      const element = getElement(target, true);
      assertInDocument(element);
      await run(element);
      return;
    }

    await waitFor(async () => {
      const element = getElement(target, true);
      assertInDocument(element);
      await run(element);
    });
  }

  return {
    fill: async (target: Locator, text: string) =>
      withPresentElement(target, async (element) => {
        await userEvent.click(element);
        await userEvent.clear(element);
        await typeImeText(element, text, composeOptions);
      }),
    type: async (target: Locator, text: string) =>
      withPresentElement(target, async (element) => {
        await userEvent.click(element);
        await typeImeText(element, text, composeOptions);
      }),
  } satisfies Pick<ActionStepDefinitionDict, "fill" | "type">;
}

export type CdpImeActions = ReturnType<typeof createCdpImeActions>;

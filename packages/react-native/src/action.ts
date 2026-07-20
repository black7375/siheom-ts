import { userEvent } from "@testing-library/react-native";
import { waitFor } from "@testing-library/react-native";
import type { TestInstance } from "test-renderer";
import type { ActionStepDefinitionDict, Locator } from "../../core/src/types.ts";
import { expect } from "vitest";
import { getElement } from "./query.ts";

type DefaultActionsOptions = {
  resolveElement?: "sync" | "waitFor";
};

export function createDefaultActions(options: DefaultActionsOptions = {}) {
  const user = userEvent.setup();
  const resolveElement = options.resolveElement ?? "waitFor";

  async function withPresentElement(
    target: Locator,
    run: (element: TestInstance) => Promise<void>,
  ) {
    if (resolveElement === "sync") {
      const element = getElement(target, true);
      expect(element).toBeOnTheScreen();
      await run(element);
      return;
    }

    await waitFor(async () => {
      const element = getElement(target, true);
      expect(element).toBeOnTheScreen();
      await run(element);
    });
  }

  return {
    click: async (target: Locator) =>
      withPresentElement(target, async (element) => {
        await user.press(element);
      }),
    dblclick: async (target: Locator) => {
      throw new Error("dblclick is not supported in React Native");
    },
    hover: async (target: Locator) => {
      throw new Error("hover is not supported in React Native");
    },
    fill: async (target: Locator, text: string) =>
      withPresentElement(target, async (element) => {
        await user.clear(element);
        await user.type(element, text);
      }),
    type: async (target: Locator, text: string) =>
      withPresentElement(target, async (element) => {
        await user.type(element, text);
      }),
    tab: async (_target: Locator) => {
      throw new Error("tab is not supported in React Native");
    },
    upload: async (_target: Locator, _file: File) => {
      throw new Error("upload is not supported in React Native");
    },
  } satisfies ActionStepDefinitionDict;
}

export const defaultActions = createDefaultActions();

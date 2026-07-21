import { waitFor } from "@testing-library/dom";
import { userEvent, type UserEvent } from "@testing-library/user-event";
import { getElement, type ActionStepDefinitionDict, type Locator } from "@siheom/core";

import { resolveProfile, type ImeProfile } from "../profiles";
import { typeHanja } from "./typeHanja";

export type CreateHanjaActionsOptions = {
  user?: UserEvent;
  resolveElement?: "sync" | "waitFor";
  profile?: string | ImeProfile;
};

/**
 * Siheom action registry for Hanja conversion.
 * Use with `extendSiheom(base, { actions: createHanjaActions() })` then
 * `actions.typeHanja(query.combobox("검색"), "金泰熙", "김태희")`.
 */
export function createHanjaActions(options: CreateHanjaActionsOptions = {}) {
  const user = options.user ?? userEvent.setup();
  const resolveElement = options.resolveElement ?? "waitFor";
  const profile = resolveProfile(options.profile);

  async function withPresentElement(target: Locator, run: (element: HTMLElement) => Promise<void>) {
    if (resolveElement === "sync") {
      const element = getElement(target, true);
      if (!element.isConnected) {
        throw new Error("Expected locator target to resolve to an element in the document");
      }
      await run(element);
      return;
    }

    await waitFor(async () => {
      const element = getElement(target, true);
      if (!element.isConnected) {
        throw new Error("Expected locator target to resolve to an element in the document");
      }
      await run(element);
    });
  }

  return {
    typeHanja: async (target: Locator, hanja: string, hangul: string) =>
      withPresentElement(target, async (element) => {
        if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
          throw new Error("typeHanja requires an input or textarea");
        }
        await user.click(element);
        await typeHanja(element, hanja, hangul, { profile });
      }),
  } satisfies ActionStepDefinitionDict;
}

export type HanjaActions = ReturnType<typeof createHanjaActions>;

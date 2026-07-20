import { page, userEvent, type Locator as BrowserLocator } from "vitest/browser";
import type { ActionStepDefinitionDict, Locator } from "@siheom/core";
import { locatorLog } from "../../core/src/query.ts";
import { expect } from "vitest";
import { getElementFromLocator, toBrowserLocator } from "./browserLocator.ts";

type BrowserActionsOptions = {
  resolveElement?: "sync" | "waitFor";
};

function hasUserEventKeys(text: string): boolean {
  return /[{][^}]+[}]/.test(text);
}

function isCheckboxOrRadioTarget(target: Locator): boolean {
  return target.role === "checkbox" || target.role === "radio";
}

/** True when Playwright can realistically pointer-click this element. */
function isPointerInteractable(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) {
    return false;
  }

  const style = getComputedStyle(element);
  if (
    style.visibility === "hidden" ||
    style.display === "none" ||
    style.pointerEvents === "none" ||
    Number.parseFloat(style.opacity) === 0
  ) {
    return false;
  }

  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  if (cx < 0 || cy < 0 || cx > window.innerWidth || cy > window.innerHeight) {
    return false;
  }

  const top = document.elementFromPoint(cx, cy);
  if (!top) {
    return false;
  }

  return top === element || element.contains(top);
}

/**
 * Headless UI often exposes role=checkbox on a HiddenInput (Ark) or a covered
 * native input (React Aria). Playwright refuses those pointer targets; a real
 * user clicks the visible label text instead.
 */
async function clickCheckboxOrRadio(target: Locator, locator: BrowserLocator) {
  const element = locator.query() ?? locator.element();
  if (isPointerInteractable(element)) {
    await locator.click();
    return;
  }

  const root = target.within ? toBrowserLocator(target.within) : page;
  await root.getByText(target.name).click();
}

export function createBrowserActions(
  options: BrowserActionsOptions = {},
): ActionStepDefinitionDict {
  const resolveElement = options.resolveElement ?? "waitFor";

  async function withPresentLocator(
    target: Locator,
    run: (locator: ReturnType<typeof toBrowserLocator>) => Promise<void>,
  ) {
    const locator = toBrowserLocator(target);

    if (resolveElement === "sync") {
      locator.element();
      await run(locator);
      return;
    }

    await run(locator);
  }

  return {
    click: async (target: Locator) =>
      withPresentLocator(target, async (locator) => {
        if (isCheckboxOrRadioTarget(target)) {
          await clickCheckboxOrRadio(target, locator);
          return;
        }

        await locator.click();
      }),
    dblclick: async (target: Locator) =>
      withPresentLocator(target, async (locator) => {
        await locator.dblClick();
      }),
    hover: async (target: Locator) =>
      withPresentLocator(target, async (locator) => {
        await locator.hover();
      }),
    fill: async (target: Locator, text: string) =>
      withPresentLocator(target, async (locator) => {
        if (hasUserEventKeys(text)) {
          await userEvent.click(locator);
          await userEvent.clear(locator);
          await userEvent.type(locator, text);
          return;
        }

        await locator.fill(text);
      }),
    type: async (target: Locator, text: string) =>
      withPresentLocator(target, async (locator) => {
        await userEvent.click(locator);
        await userEvent.type(locator, text);
      }),
    tab: async (target: Locator) => {
      if (resolveElement === "sync") {
        expect(getElementFromLocator(target, true)).toHaveFocus();
        await userEvent.tab();
        await new Promise((resolve) => setTimeout(resolve, 300));
        return;
      }

      await expect
        .poll(() => {
          expect(getElementFromLocator(target, true)).toHaveFocus();
        })
        .toBeUndefined();
      await userEvent.tab();
      await new Promise((resolve) => setTimeout(resolve, 300));
    },
    upload: async (target: Locator, file: File) =>
      withPresentLocator(target, async (locator) => {
        await locator.upload(file);
      }),
  };
}

export const defaultBrowserActions = createBrowserActions();

export const actions = {
  click: (target: Locator) =>
    ({
      action: "click",
      target,
      log: `click!      : ${locatorLog(target)}`,
    }) as const,
  dblclick: (target: Locator) =>
    ({
      action: "dblclick",
      target,
      log: `dblclick!   : ${locatorLog(target)}`,
    }) as const,
  hover: (target: Locator) =>
    ({
      action: "hover",
      target,
      log: `hover!      : ${locatorLog(target)}`,
    }) as const,
  fill: (target: Locator, text: string) =>
    ({
      action: "fill",
      target,
      args: [text],
      log: `fill!       : ${locatorLog(target)} with "${text}"`,
    }) as const,
  type: (target: Locator, text: string) =>
    ({
      action: "type",
      target,
      args: [text],
      log: `type!       : ${locatorLog(target)} with "${text}"`,
    }) as const,
  tab: (target: Locator) =>
    ({
      action: "tab",
      target,
      log: `tab!        : ${locatorLog(target)}`,
    }) as const,
  upload: (target: Locator, file: File) =>
    ({
      action: "upload",
      target,
      args: [file],
      log: `upload!     : ${locatorLog(target)} with "${file.name}"`,
    }) as const,
};

import { page, type Locator as BrowserLocator } from "vitest/browser";
import type { Locator } from "@siheom/core";

function queryFromRoot(root: BrowserLocator | typeof page, locator: Locator): BrowserLocator {
  if (locator.role === "label") {
    return root.getByLabelText(locator.name);
  }

  if (locator.role === "text") {
    return root.getByText(locator.name);
  }

  return root.getByRole(locator.role, { name: locator.name });
}

export function toBrowserLocator(locator: Locator): BrowserLocator {
  const root = locator.within ? toBrowserLocator(locator.within) : page;
  return queryFromRoot(root, locator);
}

export function getElementFromLocator(locator: Locator, sync: boolean): HTMLElement{
  const browserLocator = toBrowserLocator(locator);
  const result = sync ? browserLocator.element() : (browserLocator.query() ?? browserLocator.element());
  if (result instanceof HTMLElement) {
    return result;
  }

  throw new Error("Element not found");
}

export function getElementsFromLocator(locator: Locator, sync: boolean): HTMLElement[] {
  const browserLocator = toBrowserLocator(locator);
  if (sync) {
    const elements = browserLocator.elements().filter((element): element is HTMLElement => element instanceof HTMLElement);

    return elements;
  }

  const elements = browserLocator.elements().filter((element): element is HTMLElement => element instanceof HTMLElement);
  return elements;
}

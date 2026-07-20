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

export function getElementFromLocator(locator: Locator, sync: boolean): HTMLElement {
  const browserLocator = toBrowserLocator(locator);
  return sync ? browserLocator.element() : (browserLocator.query() ?? browserLocator.element());
}

export function getElementsFromLocator(locator: Locator, sync: boolean): HTMLElement[] {
  const browserLocator = toBrowserLocator(locator);
  if (sync) {
    return browserLocator.elements();
  }

  const elements = browserLocator.elements();
  if (elements.length > 0) {
    return elements;
  }

  return [browserLocator.element()];
}

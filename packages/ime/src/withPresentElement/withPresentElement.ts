import { waitFor } from "@testing-library/dom";
import { getElement, type Locator } from "@siheom/core";

export function isEditable(
  element: HTMLElement,
): element is HTMLInputElement | HTMLTextAreaElement {
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
}

function assertInDocument(element: HTMLElement): void {
  if (!element.isConnected) {
    throw new Error("Expected locator target to resolve to an element in the document");
  }
}

export type ResolveElementMode = "sync" | "waitFor";

/**
 * Resolve a locator to a connected element (sync or waitFor), then run `fn`.
 */
export async function withPresentElement(
  target: Locator,
  resolveElement: ResolveElementMode,
  run: (element: HTMLElement) => Promise<void>,
): Promise<void> {
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

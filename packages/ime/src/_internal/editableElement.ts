import { isEditable } from "../withPresentElement";

/** Targets that can receive lexical-android-firefox composition emulation. */
export function isLexicalComposeTarget(
  element: HTMLElement,
): element is HTMLInputElement | HTMLTextAreaElement | HTMLElement {
  return isEditable(element) || element.isContentEditable;
}

export function readEditableText(element: HTMLElement): string {
  if (isEditable(element)) {
    return element.value;
  }
  return element.textContent ?? "";
}

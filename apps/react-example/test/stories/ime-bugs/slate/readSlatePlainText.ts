/** Visible text from Slate contenteditable (excludes placeholder). */
export function readSlatePlainText(element: HTMLElement | null): string {
  if (!element) return "";
  const clone = element.cloneNode(true) as HTMLElement;
  for (const placeholder of clone.querySelectorAll("[data-slate-placeholder]")) {
    placeholder.remove();
  }
  return clone.textContent ?? "";
}

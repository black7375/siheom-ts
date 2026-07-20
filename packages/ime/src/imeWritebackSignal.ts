/** Host marks the element after a deferred controlled `value` writeback (cancels IME). */
export function markImeControlledWriteback(element: HTMLElement): void {
  element.dataset.siheomImeWriteback = "1";
}

/** True if the host wrote back since the last check (and clears the flag). */
export function consumeImeControlledWriteback(element: HTMLElement): boolean {
  if (element.dataset.siheomImeWriteback === "1") {
    delete element.dataset.siheomImeWriteback;
    return true;
  }
  return false;
}

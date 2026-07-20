/** Must match `@siheom/ime` `markImeControlledWriteback` (dataset contract for the emulator). */
export function markImeControlledWriteback(element: HTMLElement): void {
  element.dataset.siheomImeWriteback = "1";
}

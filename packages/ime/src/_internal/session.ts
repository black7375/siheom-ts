export type ImeComposeSession = {
  composing: boolean;
  /** Committed text before the active preedit (excludes suffix after caret). */
  committed: string;
  /** Active composition preedit (current syllable / jamo cluster). */
  preedit: string;
  /** Text after the caret / composition range. */
  suffix: string;
};

const sessions = new WeakMap<HTMLInputElement | HTMLTextAreaElement, ImeComposeSession>();

export function getImeSession(
  element: HTMLInputElement | HTMLTextAreaElement,
): ImeComposeSession | undefined {
  return sessions.get(element);
}

export function setImeSession(
  element: HTMLInputElement | HTMLTextAreaElement,
  session: ImeComposeSession,
): void {
  sessions.set(element, session);
}

export function clearImeSession(element: HTMLInputElement | HTMLTextAreaElement): void {
  sessions.delete(element);
}

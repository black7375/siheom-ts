import { waitFor } from "@testing-library/dom";
import { virtual } from "@guidepup/virtual-screen-reader";
import { expect } from "vitest";
import { getElement, type Locator } from "@siheom/core";
import type { AssertionStepDefinitionDict } from "@siheom/core";

export type ScreenReaderAssertions = {
  screenReaderItemText: (target: Locator, expected: string) => Promise<void>;
  screenReaderLastSpokenPhrase: (target: Locator, expected: string) => Promise<void>;
  screenReaderSpokenPhraseLog: (target: Locator, expected: string[]) => Promise<void>;
  screenReaderContainsSpokenPhrase: (target: Locator, phrase: string) => Promise<void>;
  screenReaderNotContainsSpokenPhrase: (target: Locator, phrase: string) => Promise<void>;
  screenReaderCursorOn: (target: Locator, expected?: boolean) => Promise<void>;
};

/**
 * Assertions over the virtual screen reader's spoken phrase log.
 *
 * Log-level assertions take a `Locator` for the siheom registry shape; the
 * target names the UI the screen reader is scoped to (conventionally the app
 * root or the landmark being read) and is not resolved.
 */
export function createScreenReaderAssertions(): ScreenReaderAssertions {
  return {
    screenReaderItemText: async (_target: Locator, expected: string) => {
      await waitFor(async () => {
        expect(await virtual.itemText()).toBe(expected);
      });
    },
    screenReaderLastSpokenPhrase: async (_target: Locator, expected: string) => {
      await waitFor(async () => {
        expect(await virtual.lastSpokenPhrase()).toBe(expected);
      });
    },
    screenReaderSpokenPhraseLog: async (_target: Locator, expected: string[]) => {
      await waitFor(async () => {
        expect(await virtual.spokenPhraseLog()).toEqual(expected);
      });
    },
    screenReaderContainsSpokenPhrase: async (_target: Locator, phrase: string) => {
      await waitFor(async () => {
        const log = await virtual.spokenPhraseLog();
        expect(log.some((spoken) => spoken.includes(phrase))).toBe(true);
      });
    },
    screenReaderNotContainsSpokenPhrase: async (_target: Locator, phrase: string) => {
      await waitFor(async () => {
        const log = await virtual.spokenPhraseLog();
        expect(log.some((spoken) => spoken.includes(phrase))).toBe(false);
      });
    },
    screenReaderCursorOn: async (target: Locator, expected = true) => {
      await waitFor(() => {
        const element = getElement(target, true);
        if (expected) {
          expect(virtual.activeNode).toBe(element);
        } else {
          expect(virtual.activeNode).not.toBe(element);
        }
      });
    },
  };
}

export function screenReaderAssertions(): AssertionStepDefinitionDict {
  return createScreenReaderAssertions();
}
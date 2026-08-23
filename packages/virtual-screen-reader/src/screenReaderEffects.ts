import { virtual } from "@guidepup/virtual-screen-reader";
import type { EffectStepDefinitionDict } from "@siheom/core";

export type ScreenReaderEffects = {
  screenReaderNext: () => Promise<void>;
  screenReaderPrevious: () => Promise<void>;
  screenReaderAct: () => Promise<void>;
  screenReaderPress: (key: string) => Promise<void>;
  screenReaderType: (text: string) => Promise<void>;
  screenReaderPerform: (command: string, options?: Record<string, unknown>) => Promise<void>;
  screenReaderClick: () => Promise<void>;
  screenReaderClearLog: () => Promise<void>;
  screenReaderInteract: () => Promise<void>;
  screenReaderStopInteracting: () => Promise<void>;
};

/**
 * Effects that move the virtual screen reader cursor and interact through it.
 * Cursor navigation has no siheom Locator target, so these are effects.
 */
export function createScreenReaderEffects(): ScreenReaderEffects {
  return {
    screenReaderNext: async () => {
      await virtual.next();
    },
    screenReaderPrevious: async () => {
      await virtual.previous();
    },
    screenReaderAct: async () => {
      await virtual.act();
    },
    screenReaderPress: async (key: string) => {
      await virtual.press(key);
    },
    screenReaderType: async (text: string) => {
      await virtual.type(text);
    },
    screenReaderPerform: async (command: string, options?: Record<string, unknown>) => {
      await virtual.perform(command as never, options as never);
    },
    screenReaderClick: async () => {
      await virtual.click();
    },
    screenReaderClearLog: async () => {
      await virtual.clearSpokenPhraseLog();
    },
    screenReaderInteract: async () => {
      await virtual.interact();
    },
    screenReaderStopInteracting: async () => {
      await virtual.stopInteracting();
    },
  };
}

export function screenReaderEffects(): EffectStepDefinitionDict {
  return createScreenReaderEffects();
}

import { virtual } from "@guidepup/virtual-screen-reader";
import type { GivenStepDefinitionDict } from "@siheom/core";

export type ScreenReaderGivens = {
  startScreenReader: (container?: Node) => Promise<void>;
  stopScreenReader: () => Promise<void>;
};

/** Givens that start/stop the virtual screen reader over the rendered UI. */
export function createScreenReaderGivens(): ScreenReaderGivens {
  return {
    startScreenReader: async (container?: Node) => {
      await virtual.stop();
      await virtual.start({ container: container ?? document.body });
    },
    stopScreenReader: async () => {
      await virtual.stop();
    },
  };
}

export function screenReaderGivens(): GivenStepDefinitionDict {
  return createScreenReaderGivens();
}
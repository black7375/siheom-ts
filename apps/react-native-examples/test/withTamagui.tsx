import type { ReactElement } from "react";

/** Tests use plain RN a11y; Storybook wraps with TamaguiProvider separately. */
export function withTamagui(element: ReactElement): ReactElement {
  return element;
}

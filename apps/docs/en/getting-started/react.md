# React quick start

This page covers running tests in a real browser, writing your first test, reading failure reports, and wrapping components with providers.

What you will learn:

- How to run tests in a real browser with vitest browser mode
- How to write your first test
- How to use action and assertion steps
- How to read the report when a test fails
- How to wrap components with providers

## Setup

siheom recommends **vitest browser mode** (Playwright provider) so UI renders in real Chromium (or another browser). jsdom and happy-dom are not recommended.

Dev dependencies:

```bash
yarn add -D vitest @vitest/browser playwright @vitejs/plugin-react
yarn playwright install chromium
yarn add @siheom/react @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

`@siheom/react-example` downloads Chromium on `postinstall`.

`vitest.config.ts`:

```ts
/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    setupFiles: "./test/setupTests.ts",
    include: ["test/**/*.test.tsx"],
    browser: {
      enabled: true,
      headless: true,
      provider: "playwright",
      instances: [{ browser: "chromium" }],
    },
  },
});
```

`test/setupTests.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Run:

```bash
yarn vitest
```

See `apps/react-example` in the repo for a full setup.

## Your first test

Pass steps to `runSiheom` in order. Do not use `await` in the test body — return `runSiheom(...)` and let the interpreter run.

```tsx
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { Counter } from "./Counter";

describe("Counter", () => {
  it("increments the counter", () => {
    return runSiheom(
      given.render(<Counter />),
      actions.click(query.button("0")),
      actions.click(query.button("1")),
      assertions.visible(query.button("2")),
    );
  });
});
```

- `given.render` mounts Counter in a real browser.
- `actions.click` presses the button that shows the current value, twice.
- `assertions.visible` checks that a button labeled `2` is on screen.
- `query.button("0")` finds the element by role `button` and accessible name `"0"`.

## What a failure looks like

When an assertion fails, siheom puts execution logs, the original error, and an accessibility snapshot into one `Error` message.

```tsx
return runSiheom(
  given.render(<Counter />),
  actions.click(query.button("0")),
  actions.click(query.button("1")),
  // Fails: the value is 2, not 3
  assertions.visible(query.button("3")),
);
```

Example report:

```text
[Logs]

click!      : button "0"
click!      : button "1"

[Original Error Message]

Unable to find an accessible element with the role "button" and name "3"

[A11y Snapshot]

- button "2"
```

You can see how far the test got (`[Logs]`), what went wrong (`[Original Error Message]`), and what is on screen (`[A11y Snapshot]`) in one place.

## Wrapping with providers

If you need a Router or Theme Provider, extend `given.render`.

```ts
import { extendSiheom, defaultActions, defaultAssertions } from "@siheom/core";
import { render } from "@testing-library/react";
import { Providers } from "./Providers";

const { runSiheom, given, actions, assertions, query } = extendSiheom(
  {
    actions: defaultActions,
    assertions: defaultAssertions,
    givens: {
      render: async (ui) => {
        render(<Providers>{ui}</Providers>);
      },
    },
  },
  {},
);
```

Export these bindings from a test helper module and reuse them across the suite. See [given](/en/concepts/given) for details.

## Next steps

- [Concepts overview](/en/concepts) — given / action / assert and locators
- [actions API](/en/configuration/actions) — click, fill, type, …
- [assertions API](/en/configuration/assertions) — visible, a11ySnapshot, …
- [@siheom/ime](/en/guides/ime) — Replace `fill`/`type` with Hangul IME composition
- [Example: Counter](/en/examples/counter) — Including a11y snapshots
- [Comparisons](/en/comparisons) — Testing Library and Playwright

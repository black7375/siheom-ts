# Svelte quick start

This page covers running tests in a real browser, writing your first test, reading failure reports, and wrapping components with context.

What you will learn:

- How to run tests in a real browser with vitest browser mode
- How to write your first test
- How to use action and assertion steps
- How to read the report when a test fails
- How to wrap components with context

## Setup

siheom recommends **vitest browser mode** (Playwright provider) so UI renders in real Chromium (or another browser). jsdom and happy-dom are not recommended.

Dev dependencies:

```bash
bun add -d vitest @vitest/browser playwright @sveltejs/vite-plugin-svelte
bunx playwright install chromium
bun add @siheom/svelte svelte @testing-library/svelte @testing-library/jest-dom @testing-library/user-event
```

`vitest.config.ts`:

```ts
/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  test: {
    setupFiles: "./test/setupTests.ts",
    include: ["test/**/*.test.ts"],
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
bunx vitest
```

## Your first test

Pass steps to `runSiheom` in order. Do not use `await` in the test body — return `runSiheom(...)` and let the interpreter run.

```ts
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/svelte";
import Counter from "./Counter.svelte";

describe("Counter", () => {
  it("increments the counter", () => {
    return runSiheom(
      given.render(Counter),
      actions.click(query.button("0")),
      actions.click(query.button("1")),
      assertions.visible(query.button("2")),
    );
  });
});
```

- `given.render` mounts Counter in a real browser via `@testing-library/svelte`'s `render`.
- `actions.click` presses the button that shows the current value, twice.
- `assertions.visible` checks that a button labeled `2` is on screen.
- `query.button("0")` finds the element by role `button` and accessible name `"0"`.

## What a failure looks like

When an assertion fails, siheom puts execution logs, the original error, and an accessibility snapshot into one `Error` message.

```ts
return runSiheom(
  given.render(Counter),
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

## Wrapping with context

If a component reads values from Svelte's context API, extend `given.render`. `@testing-library/svelte`'s `render` accepts a `context` Map as its second argument.

```ts
import { extendSiheom, defaultActions, defaultAssertions } from "@siheom/core";
import { render } from "@testing-library/svelte";
import { theme } from "./theme";

const { runSiheom, given, actions, assertions, query } = extendSiheom(
  {
    actions: defaultActions,
    assertions: defaultAssertions,
    givens: {
      render: async (component) => {
        render(component, { context: new Map([["theme", theme]]) });
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
- [Comparisons](/en/comparisons) — Testing Library and Playwright

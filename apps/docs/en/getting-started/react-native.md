# React Native quick start

This page covers running tests with React Native Testing Library, writing your first test, reading failure reports, and wrapping components with providers.

What you will learn:

- How to run tests with vitest-native
- How to write your first test
- How to use action and assertion steps
- How to read the report when a test fails
- How to wrap components with providers

## Setup

React Native cannot render in a browser, so siheom renders components with React Native Testing Library on top of [vitest-native](https://github.com/nomadev/vitest-native)'s pure-JS engine.

Dev dependencies:

```bash
bun add -d vitest vitest-native @testing-library/react-native test-renderer
bun add @siheom/react-native react react-native @testing-library/jest-dom
```

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import { reactNative } from "vitest-native";

export default defineConfig({
  // engine: "mock" is a pure-JS RN for library-level unit tests.
  // Use engine: "native" in apps with a full RN/babel setup.
  plugins: [reactNative({ engine: "mock" })],
  test: {
    globals: true,
    include: ["test/**/*.test.tsx"],
  },
});
```

Run:

```bash
bunx vitest
```

## Your first test

Pass steps to `runSiheom` in order. Do not use `await` in the test body — return `runSiheom(...)` and let the interpreter run.

```tsx
import { useState } from "react";
import { Pressable, Text } from "react-native";
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react-native";

function Counter() {
  const [value, setValue] = useState(0);
  return (
    <Pressable accessibilityRole="button" onPress={() => setValue((v) => v + 1)}>
      <Text>{String(value)}</Text>
    </Pressable>
  );
}

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

- `given.render` mounts Counter with React Native Testing Library's `render`.
- `actions.click` presses the button that shows the current value, twice.
- `assertions.visible` checks that a button labeled `2` is on screen.
- `query.button("0")` finds the element by `accessibilityRole`/`role` `button` and accessible name `"0"`.

If a file has more than one test, wire `cleanupReactRoots` into `afterEach` to tear down the render tree between tests.

```ts
import { afterEach } from "vitest";
import { cleanupReactRoots } from "@siheom/react-native";

afterEach(cleanupReactRoots);
```

## What a failure looks like

When an assertion fails, siheom puts execution logs, the original error, and an accessibility snapshot into one `Error` message. The snapshot is built from `accessibilityRole`/`accessibilityLabel`/`accessibilityState`.

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

button "2"
```

You can see how far the test got (`[Logs]`), what went wrong (`[Original Error Message]`), and what is on screen (`[A11y Snapshot]`) in one place.

## Wrapping with providers

If you need a navigation container or a context provider, extend `given.render`.

```tsx
import { extendSiheom, defaultActions, defaultAssertions } from "@siheom/core";
import { render } from "@testing-library/react-native";
import { Providers } from "./Providers";

const { runSiheom, given, actions, assertions, query } = extendSiheom(
  {
    actions: defaultActions,
    assertions: defaultAssertions,
    givens: {
      render: async (element) => {
        await render(<Providers>{element}</Providers>);
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

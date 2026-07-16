# Configuration

Start with the `@siheom/react` pre-bound API; extend via `@siheom/core` factory.

## Pre-bound API (`@siheom/react`)

```ts
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
```

| Export | Role |
| --- | --- |
| `runSiheom` | Test runner |
| `actions` | User-behavior steps |
| `assertions` | Expected-state steps |
| `given` | Preconditions (`render`) |
| `query` | Role + name locators |

## API reference

- [given](/en/configuration/given)
- [actions](/en/configuration/actions)
- [assertions](/en/configuration/assertions)
- [Message map](/en/configuration/messages) — Failure-report headers

## Core factory (`@siheom/core`)

```ts
import {
  createRunSiheom,
  extendSiheom,
  overrideSiheom,
  defaultActions,
  defaultAssertions,
} from "@siheom/core";
```

Extend and replace registries with `extendSiheom` / `overrideSiheom`. See [Factory](/en/concepts/factory).

## Types

`ActionStep`, `AssertionStep`, `GivenStep`, `Step`, `Locator`, and related types are exported from `@siheom/core`.

## Next steps

- [React quick start](/en/getting-started/react) — Browser mode and first test
- [Concepts overview](/en/concepts) — Steps and locators

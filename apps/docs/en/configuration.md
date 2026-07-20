# Configuration

Start with the `@siheom/react` pre-bound API; extend via `@siheom/core` factory.

## Pre-bound API (`@siheom/react`)

```ts
import {
  actions,
  assertions,
  effect,
  given,
  query,
  runSiheom,
  withFakeTimers,
} from "@siheom/react";
```

| Export | Role |
| --- | --- |
| `runSiheom` | Test runner |
| `actions` | User-behavior steps |
| `assertions` | Expected-state steps |
| `given` | Preconditions (`render`) |
| `effect` | Environment effect steps (time travel) |
| `withFakeTimers` | Fake-timer scope |
| `query` | Role + name locators |
| `reactEffects` / `reactFakeTimerScope` | React adapters for `overrideSiheom` bases |

## API reference

- [given](/en/configuration/given)
- [actions](/en/configuration/actions)
- [assertions](/en/configuration/assertions)
- [effect](/en/configuration/effects)
- [Message map](/en/configuration/messages) — Failure-report headers

For the conceptual guide, see [effect · withFakeTimers](/en/concepts/effects).

## Core factory (`@siheom/core`)

```ts
import {
  createRunSiheom,
  extendSiheom,
  overrideSiheom,
  defaultActions,
  defaultAssertions,
  defaultEffects,
  effect,
  withFakeTimers,
} from "@siheom/core";
```

Extend and replace registries with `extendSiheom` / `overrideSiheom`. See [Factory](/en/concepts/factory).

## Types

`ActionStep`, `AssertionStep`, `GivenStep`, `EffectStep`, `FakeTimersScopeStep`, `Step`, `Locator`, and related types are exported from `@siheom/core`.

## Next steps

- [React quick start](/en/getting-started/react) — Browser mode and first test
- [Concepts overview](/en/concepts) — Steps and locators

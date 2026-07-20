# effect · withFakeTimers

UI that depends on `setTimeout` / `setInterval` or `Date` should run under Vitest fake timers. Siheom expresses that with **effect** steps and a **`withFakeTimers` scope**.

## Why a scope

Turning on `vi.useFakeTimers()` globally can leak across tests or hang user-event. `withFakeTimers(...steps)` installs fake timers only for the inner steps, then restores real timers.

`@siheom/react` ships React/`act`-aware effects and fake-timer hooks.

## API

```tsx
import {
  actions,
  assertions,
  effect,
  given,
  query,
  runSiheom,
  withFakeTimers,
} from "@siheom/react";

return runSiheom(
  withFakeTimers(
    given.render(<CountdownApp durationMinutes={25} />),
    actions.click(query.button("Start")),
    effect.elapsed(1_000),
    assertions.textContent(query.timer("Time remaining"), "24:59"),
  ),
);
```

| Step | Meaning |
| --- | --- |
| `withFakeTimers(...steps)` | Fake-timer scope; only inner steps are affected |
| `effect.elapsed(ms)` | Advance fake time by `ms` (wrapped in `act` on React) |
| `effect.runAllTimers()` | Flush pending timers. Avoid with an open `setInterval` |

Inside the scope, each **action** advances a short simulated user delay (~50ms). Jump app time explicitly with `effect.elapsed` only.

## Reuse normal assertions

There is no timer-specific assertion. For `role="timer"` UI, use `query.timer("…")` with `assertions.textContent` / `visible`.

```tsx
assertions.textContent(query.timer("Time remaining"), "24:59")
assertions.visible(query.status("Done"))
```

## When using overrideSiheom

If the project wraps `given.render` via `overrideSiheom`, pass **`effects`** and **`fakeTimerScope`** on the base registry so `withFakeTimers` keeps working.

```ts
import { overrideSiheom, defaultActions, defaultAssertions } from "@siheom/core";
import { defaultGivens, reactEffects, reactFakeTimerScope } from "@siheom/react";

export const { runSiheom } = overrideSiheom(
  {
    givens: defaultGivens,
    actions: defaultActions,
    assertions: defaultAssertions,
    effects: reactEffects,
    fakeTimerScope: reactFakeTimerScope,
  },
  { givens: { render: async (el) => render(<Provider>{el}</Provider>) } },
);
```

## Next steps

- [Countdown example](/en/examples/countdown) — start / pause / reset / complete
- [locator](/en/concepts/locator) — `query.timer`
- [Factory](/en/concepts/factory) — Extending the effect registry
- [Configuration](/en/configuration) — Export list

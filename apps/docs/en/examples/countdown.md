# Countdown

A pomodoro-style countdown. Elapsed time is derived from `startTime` and `now`. Tests jump time with `withFakeTimers` + `effect.elapsed`.

Source: `apps/react-example/test/stories/countdown/`.

## Accessibility surface

| Element | Role / name |
| --- | --- |
| Remaining time | `role="timer"` · `aria-label` (e.g. `"Time remaining"`) |
| Start / pause / reset | `button` + `aria-label` |
| Done | `role="status"` · `aria-label` (e.g. `"Done"`) |

## Test: one second after start

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

## Test: pause

```tsx
return runSiheom(
  withFakeTimers(
    given.render(<CountdownApp durationMinutes={25} />),
    actions.click(query.button("Start")),
    effect.elapsed(1_000),
    actions.click(query.button("Pause")),
    effect.elapsed(5_000),
    assertions.textContent(query.timer("Time remaining"), "24:59"),
  ),
);
```

After pause, further `effect.elapsed` must not change the displayed remaining time.

## Test: reset · complete

```tsx
return runSiheom(
  withFakeTimers(
    given.render(<CountdownApp durationMinutes={25} />),
    actions.click(query.button("Start")),
    effect.elapsed(1_000),
    actions.click(query.button("Reset")),
    assertions.textContent(query.timer("Time remaining"), "25:00"),
  ),
);

return runSiheom(
  withFakeTimers(
    given.render(<CountdownApp durationMinutes={1 / 60} />),
    actions.click(query.button("Start")),
    effect.elapsed(1_000),
    assertions.visible(query.status("Done")),
  ),
);
```

Prefer a short `durationMinutes` for completion — advancing a full 25 minutes against a 1s `setInterval` is slow.

## Implementation notes

- Remaining time is **derived** from `startTime`, `now`, and `frozenElapsedMs` — not ticked down.
- The React UI uses `useReducer` + `countdownReducer`.
- See [effect · withFakeTimers](/en/concepts/effects) for the runner API.

## Next steps

- [effect · withFakeTimers](/en/concepts/effects)
- [Counter](/en/examples/counter) — Smaller click/visible example
- [Configuration](/en/configuration)

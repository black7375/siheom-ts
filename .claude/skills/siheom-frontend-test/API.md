# Siheom public API

Import everything from `@siheom/react`:

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
```

Do not import from `@siheom/core` in app tests unless extending the runner (see `runSiheom.tsx` pattern).

## runSiheom

```tsx
await runSiheom(step1, step2, step3, …);
```

Runs steps in order. On failure, logs each step and an **a11y snapshot** of the page — use it to fix `query` names.

Sync or async tests both work; prefer `async` when using `await`.

## given

| Step | Meaning |
|------|---------|
| `given.render(element)` | Render with Testing Library |

Only built-in given. Project-specific prep (storage, props, providers) goes in a **setup** function that returns `given.render(…)`.

## query

`query.<role>(name)` — `name` is string or `RegExp`. Matches Testing Library `getByRole` / `getByLabelText`.

| Role | Use for |
|------|---------|
| `textbox` | `input`, `textarea` — match associated `<label>` text |
| `checkbox` | checkbox — match label or `aria-label` |
| `button` | buttons — match visible text or `aria-label` |
| `link` | `<a>`, `<Link>` — match accessible name |
| `listitem` | `<li>` — needs `aria-label` or name from contents |
| `region` | landmark with `aria-label` (e.g. `<section aria-label="…">`) |
| `status` | `role="status"` — use `aria-label` when text is split across nodes |
| `timer` | `role="timer"` — countdown / remaining-time displays (`aria-label`) |
| `form` | `<form>` or `aria-label` on form |
| `alertdialog` | modal dialogs |
| `navigation` | nav landmarks |
| `label` | **labeled control** via `getByLabelText` — not the label element |

**Scoped query:**

```tsx
query.within(query.alertdialog("삭제 확인"), query.button("삭제"))
```

Common roles also include: `heading`, `list`, `dialog`, `tab`, `tabpanel`, `combobox`, `radio`, `switch`, `progressbar`, `img`, `table`, etc.

## actions

| Action | Usage |
|--------|--------|
| `click(target)` | Single click |
| `dblclick(target)` | Double click |
| `hover(target)` | Move pointer over element |
| `fill(target, text)` | Clear field, then type. Append `{Enter}`, `{Escape}`, `{Tab}` in `text` |
| `type(target, text)` | Type without clearing |
| `tab(target)` | Tab from focused element |
| `upload(target, file)` | File input |

## assertions

| Assertion | Meaning |
|-----------|---------|
| `visible(target)` | In document, not `aria-hidden` |
| `not.visible(target)` | Absent or hidden |
| `focused(target)` / `not.focused` | Element has document focus |
| `checked(target)` / `not.checked` | Checkbox/radio state |
| `value(target, string)` / `not.value` | Input value |
| `textContent(target, string)` / `not.textContent` | Element text content |
| `disabled(target)` / `not.disabled` | Disabled state |
| `expanded(target)` / `not.expanded` | `aria-expanded` |
| `selected(target)` / `not.selected` | `aria-selected` |
| `current(target, "page")` / `not.current` | `aria-current` — `"page"`, `"step"`, `"location"`, etc. |
| `count(target, n)` / `not.count` | Number of matching elements |
| `href(target, url)` / `not.href` | Link href |
| `errormessage(target, msg)` / `not.errormessage` | Accessible error message |
| `description(target, msg)` | Accessible description |
| `a11ySnapshot(target, "file.snap")` | File snapshot under `__snapshots__/` |
| `tableSnapshot(target, "file.snap")` | Markdown table snapshot |

## effect + withFakeTimers

For UI driven by `setTimeout` / `setInterval` / `Date`, wrap the relevant steps in `withFakeTimers` and advance time with **effect** steps. Prefer asserting through the accessible tree (`textContent`, `visible`) — do not invent timer-specific assertions.

| Step | Meaning |
|------|---------|
| `withFakeTimers(...steps)` | Scope: install fake timers, run inner steps, restore real timers |
| `effect.elapsed(ms)` | Advance fake time by `ms` (React: wrapped in `act`) |
| `effect.runAllTimers()` | Run all pending timers (avoid with open `setInterval`) |

```tsx
await runSiheom(
  withFakeTimers(
    given.render(<Countdown durationMinutes={25} />),
    actions.click(query.button("시작")),
    effect.elapsed(1_000),
    assertions.textContent(query.timer("남은 시간"), "24:59"),
  ),
);
```

Inside the scope, each user action advances a small simulated delay (~50ms) so pointer timing stays realistic. Only steps **inside** `withFakeTimers` see fake timers.

## Vitest integration

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "../index.css"; // if Tailwind/styles needed
```

- `beforeEach(() => localStorage.clear())` for storage-backed apps.
- `cleanup()` before second render in reload tests; re-pass router `initialEntries` (and re-seed storage only when the scenario requires it).

## Extending the runner (optional)

When a project wraps providers, pass **effects** and **fakeTimerScope** on the base registry so `withFakeTimers` keeps working:

```tsx
// runSiheom.tsx
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
  {
    givens: {
      render: async (el) => render(<TestProvider>{el}</TestProvider>),
    },
  },
);
```

Import `runSiheom` from that file instead of `@siheom/react` when needed. Do not add custom `given.setup` — use plain **setup** functions in test files.

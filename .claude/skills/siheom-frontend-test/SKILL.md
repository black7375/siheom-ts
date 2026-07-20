---
name: siheom-frontend-test
description: >-
  Siheom frontend integration tests with @siheom/react. Self-contained for package
  users (no AGENTS.md required). Use when building or testing React UI, runSiheom
  specs, accessible-name tests, or feature work with plan.md and Red-Green-Refactor.
  Discover npm/pnpm/yarn/bun scripts from package.json; ask user to add Vitest, oxlint,
  oxfmt if missing.
---

# Siheom Frontend Test

Write tests users care about — through the **accessible name** tree, not CSS, placeholders, or Siheom internals.

**Self-contained:** this skill includes TDD + project setup for consumers of `@siheom/react`. If the repo has `AGENTS.md`, follow it too; otherwise use [TDD.md](TDD.md) and [SETUP.md](SETUP.md) here.

**Do not** read `packages/core` unless extending the runner — see [API.md](API.md) and `runSiheom.tsx` pattern in examples.

## TDD cycle (one plan item at a time)

Full rules: [TDD.md](TDD.md). Summary:

```
1. plan.md → next unchecked item only
2. RED    → one `it`, user-visible outcome; run tests; confirm THIS test fails
3. GREEN  → minimum code until THIS test passes; run package test script
4. REFACTOR → tidy while green ([Tidy First](TDD.md))
5. Mark `[x]` → commit (structural vs behavioral)
6. Repeat
```

| Phase | Allowed | Forbidden |
| ----- | ------- | --------- |
| RED | one new `it`, fixtures, types | production code for later plan items |
| GREEN | code for the failing test only | full feature scaffold |
| REFACTOR | rename/extract/style | new behavior, new `it` |

**Recovery:** untested code → trim to passing specs → structural commit → resume plan.md.

## Project scripts

**Before running tests:** read [SETUP.md](SETUP.md) — detect package manager from lockfile, map `package.json` scripts by intent, ask the user to add Vitest / typecheck / oxlint / oxfmt when missing.

Do **not** assume `bun`, `npm run test`, or script names. Examples:

```bash
npm run test:run -- MyFeature
pnpm vitest MyFeature
yarn unit MyFeature
bun run test MyFeature
```

## Agent anti-patterns

| Symptom | Fix |
| ------- | --- |
| Whole feature before tests | Trim; one plan item per cycle ([TDD.md](TDD.md)) |
| `typeof FIXTURE as const` as param type | Explicit domain types (`Todo[]`) |
| Subset `it` duplicating setup | One outcome per `it`; chain steps inside |
| `<footer aria-label>` for `query.region` | `<section aria-label="…">` |
| CSS hides control from a11y tree | Fix visibility or use `hover` + assert |
| Assertion fails (`checked`, `focused`, …) | Fix `@siheom/core` or component a11y — not a weaker assertion |
| Assumed package manager / script names | [SETUP.md](SETUP.md) |

## Gate before commit

See [TDD.md](TDD.md) + [SETUP.md](SETUP.md): test script passes; typecheck/lint/format when the project defines them; one plan item per commit; message labels structural vs behavioral.

## Workflow (Siheom, inside Green/Red)

1. **Name the behavior** — one `it` per user-visible outcome. The name states *what* happens, not *how*.
2. **Check accessible names** — every `query.*("…")` string must match a real accessible name on the component. If missing, fix the component (`<Label htmlFor>`, `aria-label`, `aria-labelledby`, landmark `aria-label`) before writing the test. Never query by placeholder, `data-testid`, or class.
3. **Add fixture + setup** when state or provider, etc... setup repeats. **setup** is a plain function returning `given.render(…)`, not a custom `given` step.
4. **Write the runSiheom chain** — `await runSiheom(given…, actions…, assertions…)`. Order: render → act → assert.
5. **Run** — package test script with a filter for the spec file when the runner supports it.
6. **Prune** — drop tests that only restate another test's middle step, constant re-exports, or implementation details.

**Done when:** the filtered test file passes, every `query` target resolves to a documented accessible name, and plan.md matches reality.

**setup typing:**

```tsx
function setup(todos: Todo[] = [], initialEntry = "/") {
  writeTodos(todos);
  return given.render(<App initialEntries={[initialEntry]} />);
}
```

Use `Todo[]`, not `typeof SEEDED_TODOS` when the fixture is a tuple/`as const`.

## runSiheom shape

```tsx
import { actions, assertions, given, query, runSiheom } from "@siheom/react";

await runSiheom(
  given.render(<MyComponent />),           // or setup(…)
  actions.click(query.button("저장")),
  assertions.visible(query.status("저장됨")),
);
```

- **given** — only `given.render(element)`. Wrap providers inside the element or in `setup()`.
- **actions** — user input (`click`, `dblclick`, `hover`, `fill`, `type`, `tab`, `upload`).
- **assertions** — observable UI state (`visible`, `focused`, `textContent`, `checked`, …). Prefer `assertions.not.`* over negating manually. If an assertion fails, read the Siheom log + a11y snapshot, fix the runner or component, then re-run — do not replace `checked`/`focused` with snapshots unless the spec is the whole tree.

Use `actions.fill(…, "text{Enter}")` for submit; `{Escape}` to cancel. Use `query.within(container, target)` when names collide inside a region.

## setup and fixture

**setup** seeds state, then returns a given step:

```tsx
function setup(initState: T) {
  // something
  return given.render(<App initState={something} />);
}
```

- `setup([])` — empty initial state.
- `setup([FIXTURE_A, FIXTURE_B])` — skip UI steps that only exist to build state.
- Keep UI interaction in the test when the behavior *is* the interaction
- For remount/reload: `cleanup()` then `renderApp()` that does **not** re-seed storage.

**fixture** — named constants in `*.fixture.ts`, shared across tests and `toStrictEqual`.

## What belongs outside runSiheom


| Check                                            | Where                                                            |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| Callback payload, `localStorage`, API mock calls | `let result;` + `expect(…)` after `runSiheom`                    |
| Snapshot of full a11y tree                       | `assertions.a11ySnapshot(query.region("…"), "name.snap")` inside |


Persistence: one `toStrictEqual` with fixture + runtime id — not three separate `expect`s.

**Inside runSiheom** — focus, visible text, navigation state:

```tsx
assertions.focused(query.textbox("제목")),
assertions.textContent(query.status("알림"), "저장됨"),
assertions.current(query.link("목록"), "page"),
```

Do **not** reach for `document.activeElement`, `screen.getByRole`, or `query.*().get()` — they bypass the runner and break in browser mode.

## Routing

Hash/path navigation **must go through a testable router**, not raw `window.location` / `hashchange`.


| Do                                                                       | Don't                                                |
| ------------------------------------------------------------------------ | ---------------------------------------------------- |
| `MemoryRouter` + `initialEntries` prop (react-router-dom)                | `window.location.hash = …` in tests                  |
| `Link` + `useLocation()` for route/hash state                            | `addEventListener("hashchange", …)` in the component |
| `cleanup()` then re-render with the **same** `initialEntries` for reload | assume hash/URL survives `cleanup()`                 |
| `assertions.href` / `assertions.current` inside `runSiheom`              | read router state with `expect` after the chain      |




### Component shape

Expose router initial state as a prop; wrap content inside the router:

```tsx
export function MyApp({
  initialEntries = ["/"],
}: {
  initialEntries?: (string | { pathname?: string; hash?: string })[];
}) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="*" element={<MyAppContent />} />
      </Routes>
    </MemoryRouter>
  );
}

function MyAppContent() {
  const { pathname, hash } = useLocation();
  // derive view state from pathname or hash
  return (
    <Link to="/settings" aria-current={pathname === "/settings" ? "page" : undefined}>
      설정
    </Link>
  );
}
```

TanStack Router: same idea with `createMemoryHistory({ initialEntries: [initialPath] })` and an `initialPath` prop.

### setup + remount

```tsx
function setup(state: AppState, initialEntry: InitialEntry = "/") {
  seedState(state); // storage, mocks, etc.
  return given.render(<MyApp initialEntries={[initialEntry]} />);
}

// navigation
await runSiheom(
  setup(SEEDED_STATE),
  actions.click(query.link("설정")),
  assertions.current(query.link("설정"), "page"),
);

// reload — pass route via initialEntries, not window
cleanup();
await runSiheom(
  given.render(<MyApp initialEntries={["/settings"]} />),
  assertions.current(query.link("설정"), "page"),
);
```



### href in MemoryRouter

`Link to="#section"` often resolves to `href="/#section"` under MemoryRouter. Assert the **rendered** href from the failing a11y snapshot — do not assume the bare hash string.

### Nav link checklist


| Assert            | Step                                                             |
| ----------------- | ---------------------------------------------------------------- |
| Static targets    | `assertions.href(query.link("…"), "/expected/path")`             |
| Active route      | `assertions.current(query.link("…"), "page")`                    |
| Route-filtered UI | `assertions.visible` / `assertions.not.visible` on named targets |




## Test quality

- **Accessible-name seam** — assert through roles the user/agent encounters (`textbox`, `button`, `checkbox`, `link`, `listitem`, `region`, `status`).
- **No horizontal setup** — repeated `fill` chains → fixture + `setup([…])`.
- **No subset tests** — if "Enter로 저장" already dblclicks and fills, don't add "수정 모드 진입" alone. Merge: dblclick → `assertions.focused` → fill → assert outcome in **one** `it`.
- **No tautology** — don't assert storage keys, prop names, or other constants the UI never exposes.
- **Independent expected values** — literals and fixtures from the spec, not recomputed from implementation.
- **Scenario sanity** — trace fixture + actions to the end state before writing assertions; a destructive action on subset A must not assume rows outside A still exist unless the spec says so.
- **Prefer Pure function** — pure function is good. reducer is good. even if we don't test reducer, pure function will be good. Deriving computed state from original state with pure function? It's good!



## Component checklist (for testability)

Before or while writing tests, the UI should expose:


| Control          | Query                                                                              |
| ---------------- | ---------------------------------------------------------------------------------- |
| Labeled input    | `query.textbox("레이블")`                                                             |
| Labeled checkbox | `query.checkbox("레이블")`                                                            |
| Named button     | `query.button("레이블")` or `aria-label`                                              |
| List row         | `aria-label` on `<li>` → `query.listitem("…")`                                     |
| Landmark section | `aria-label` on `<section>` → `query.region("…")` — not `<footer>` (`contentinfo`) |
| Live counter     | `role="status"` + `aria-label` → `assertions.textContent(query.status("…"), "…")`  |
| Current nav link | `aria-current="page"` → `assertions.current(query.link("…"), "page")`              |
| Focused control  | after click/tab → `assertions.focused(query.textbox("…"))`                         |


`query.label("…")` resolves the **labeled control**, not the `<label>` element. For double-click on visible text, give the target its own accessible name (e.g. icon only `button` with `aria-label="${title} 제목"`).

## Reference

- TDD + Tidy First (portable): [TDD.md](TDD.md)
- Package manager + scripts + oxlint/oxfmt: [SETUP.md](SETUP.md)
- Action/assertion/query catalog: [API.md](API.md)

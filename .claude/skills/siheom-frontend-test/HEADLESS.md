# Headless UI + Siheom

Use when wrapping **Radix UI, React Aria, Ariakit, Ark UI**, or similar in tests. Reference implementation: `apps/react-example/test/stories/headless/`.

## Non-negotiables

- Read **`[A11y Snapshot]`** (or add `assertions.a11ySnapshot`) before guessing queries.
- **No keyboard workarounds** (`{ArrowDown}{Enter}`, global shortcuts) to open/select options.
- **No test hacks** (`noValidate`, `disableEnforceFocus`, backdrop `onClose` filters) to pass Siheom.
- Fix **component a11y wiring** first; query must match snapshot **role + name**.

## Select: query varies by library

| Library | Open control | Notes |
| ------- | ------------ | ----- |
| React Aria | `query.label("…")` | `placeholder=""` on `Select`; `CheckboxField` + `CheckboxButton` |
| Radix | `query.label("…")` | `htmlFor` + trigger `id`; hidden input for form |
| Ariakit | `query.label("…")` | native `<label htmlFor>` — **not** `SelectLabel` (duplicate names) |
| Ark UI | `query.combobox("…")` | trigger role is combobox; `Select.HiddenSelect` for forms |
| MUI | avoid | floating labels, dialog+menu `aria-hidden`, unstable options |

Do **not** unify tests with one query helper—role differences are intentional signals.

## Common wiring

### Dialog + form

```tsx
const dialog = query.dialog("구독하기");

await runSiheom(
  actions.click(query.button("구독하기")),
  assertions.visible(dialog),
  actions.fill(query.within(dialog, query.textbox("이름")), name),
  actions.click(query.within(dialog, query.combobox("구독할 항목"))), // or query.label
  actions.click(query.option(plan)),
  actions.click(query.within(dialog, query.checkbox("약관에 동의합니다"))),
  assertions.checked(query.checkbox("약관에 동의합니다")),
);
```

### Headless select + FormData

Radix / Ariakit: hidden `<input name={…} value={…} />` + controlled state.

Ark UI: `Select.HiddenSelect`.

React Aria: `name` on `Select` inside `Form`.

### Ariakit checkbox (React 19)

```tsx
<Checkbox render={<button type="button" className="…" />} />
```

Plus hidden input if form submit needs `name`/`required`.

## Failure checklist

1. Snapshot: exact **accessible name** (placeholder, floating label, `*` suffix).
2. Snapshot: trigger **role** (`button` vs `combobox` vs `textbox`).
3. Dialog open: is content `aria-hidden` while popover is open?
4. Options: `query.option("…")` visible in snapshot after opening?
5. Submit: does `FormData` get select/checkbox values?

## Anti-patterns (MUI experiment)

- Custom Select menu portaled → dialog hidden → options not in tree
- NativeSelect click not updating in browser mode
- `{ArrowDown}{Enter}` instead of `query.option`
- `MenuProps.disablePortal` + focus disables piled on top

Prefer React Aria, Radix, Ariakit, or Ark UI for Siheom-friendly headless forms.

## Files to copy

- Scenario: subscribe dialog — `test/stories/headless/*.test.tsx`
- Fixture: `subscribe.fixture.ts`
- Wrappers: `test/components/{react-aria,radix,ariakit,ark-ui}/`

Full prose: docs `/guides/headless-components` (repo: `apps/docs/guides/headless-components.md`).

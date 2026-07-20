# Headless UI component guide

Siheom tests target elements by **accessibility role and accessible name**. Headless libraries (Radix UI, React Aria, Ariakit, Ark UI, …) render different DOM and roles. The same “open the Select” step may need a **different query** that matches the a11y snapshot—not the same helper for every library.

Patterns below are validated in `apps/react-example/test/stories/headless/`. Read the snapshot before changing components; do not pass tests with keyboard sequences like `{ArrowDown}{Enter}`.

## Principles

1. **On failure, read the snapshot first** — `[A11y Snapshot]` or `assertions.a11ySnapshot`.
2. **Match query to the snapshot role** — same label text can mean `query.label` or `query.combobox` depending on the trigger.
3. **Fix components, don’t cheat tests** — broken names from placeholders, floating labels, portals, or focus traps need markup/a11y fixes.
4. **No keyboard workarounds** — avoid `{ArrowDown}{Enter}`, `disableEnforceFocus`, `noValidate`, etc. to bypass Siheom click/fill.
5. **Scope inside dialogs** — use `query.within(query.dialog("…"), …)` when names collide.

## Common patterns

### Dialog + form

```tsx
actions.click(query.button("Subscribe")),
assertions.visible(query.dialog("Subscribe")),
actions.fill(query.within(query.dialog("Subscribe"), query.textbox("Name")), "Jane"),
```

### Headless Select

Most headless selects are **not** native `<select>`. Form submit needs one of:

| Approach | Example |
| -------- | ------- |
| Built-in | Ark UI `Select.HiddenSelect`, React Aria `name` on `Select` |
| Hidden input + controlled value | Radix / Ariakit wrappers |

Test flow:

```tsx
actions.click(query.within(dialog, query.label("Plan"))),
// or query.combobox("Plan")

actions.click(query.option("Premium")),
```

`query.label("…")` resolves the **labeled control**, not the `<label>` element.

### Checkbox

Use `query.checkbox("…")` when the label text (or `aria-label`) is the accessible name. Custom `render={<button />}` is fine if the exposed role stays `checkbox`.

## Select query by library

| Library | Open Select | Why |
| ------- | ----------- | --- |
| React Aria | `query.label("Plan")` | Label + Select wiring |
| Radix UI | `query.label("Plan")` | `htmlFor` + trigger `id` |
| Ariakit | `query.label("Plan")` | native `<label htmlFor>` (see below) |
| Ark UI | `query.combobox("Plan")` | trigger role is `combobox` |
| MUI | ⚠️ not recommended | floating labels, dialog+menu conflicts |

Do **not** force one query across libraries—role differences are real a11y differences.

## Library notes

### React Aria Components

- Set `placeholder=""` on **`Select`**, not only `SelectValue`.
- Use `CheckboxField` + `CheckboxButton` (v1.19+), not deprecated `Checkbox`.
- Prefer `Form` + field `name`; opening via `query.label` is usually stable.

### Radix UI

- Select in forms: hidden input + controlled `value`.
- Wire `@radix-ui/react-label` with trigger `id`.
- Put `name` on `Checkbox.Root` for native submit.

### Ariakit

- Use native `<label htmlFor={id}>` instead of `SelectLabel` (duplicate names with combobox).
- Hidden input for select value in forms.
- `Checkbox render={<button type="button" />}` for React 19 + browser tests.
- Avoid `noValidate` just to satisfy required checkbox wiring.

### Ark UI

- Open with `query.combobox("…")`, not `query.label`.
- Use `createListCollection`, `Select.HiddenSelect`, `Checkbox.HiddenInput`.
- `Select.ValueText placeholder=""` keeps placeholder out of the accessible name.

### Material UI (not recommended)

Repeated issues in Siheom browser mode: unstable floating labels, dialog `aria-hidden` when menu opens, options missing from the tree, NativeSelect clicks not updating value, backdrop closing the dialog. Workarounds (`disablePortal`, keyboard shortcuts, focus hacks) conflict with Siheom’s a11y-first approach—excluded from headless comparisons.

## Failure checklist

1. Read target **role** and **name** in `[A11y Snapshot]`.
2. Ensure `query.*` strings match snapshot names exactly.
3. For Select: is the trigger `combobox`? Is the label a separate node?
4. Dialog + popover: are options portaled outside an `aria-hidden` dialog?
5. Form submit: do hidden fields / `name` props populate `FormData`?
6. Then fix markup—don’t swap queries to hide broken a11y.

## react-example reference

| Library | Spec | Wrappers |
| ------- | ---- | -------- |
| React Aria | `test/stories/headless/ReactAria.test.tsx` | `test/components/react-aria/` |
| Radix UI | `test/stories/headless/Radix.test.tsx` | `test/components/radix/` |
| Ariakit | `test/stories/headless/Ariakit.test.tsx` | `test/components/ariakit/` |
| Ark UI | `test/stories/headless/ArkUi.test.tsx` | `test/components/ark-ui/` |

Shared fixture: `test/stories/headless/subscribe.fixture.ts`

## Next steps

- [locator](/en/concepts/locator)
- [Accessibility snapshot](/en/concepts/a11y-snapshot)
- [Example: SignUpForm](/en/examples/signup-form)
- [AI agents](/en/ai-agent)

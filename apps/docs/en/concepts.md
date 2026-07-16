# Concepts

A Siheom test is an array of `given`, `action`, and `assert` step objects. The interpreter runs them in order in a real browser.

## Step kinds

| Kind | Example | Meaning |
| --- | --- | --- |
| **given** | `given.render(<App />)` | Preconditions (mount UI, …) |
| **action** | `actions.click(query.button("Save"))` | User behavior |
| **assert** | `assertions.visible(query.button("Save"))` | Expected state |

```tsx
return runSiheom(
  given.render(<Counter />),
  actions.click(query.button("0")),
  assertions.visible(query.button("1")),
);
```

Do not use `await` in the test body — `return runSiheom(...)` and let the interpreter run.

## By topic

- [given](/en/concepts/given) — Mount UI and providers
- [actions](/en/concepts/actions) — click, fill, type, …
- [assertions](/en/concepts/assertions) — visible, a11ySnapshot, …
- [locator](/en/concepts/locator) — `query` and role + name
- [Accessibility snapshot](/en/concepts/a11y-snapshot) — Semantic tree assertions
- [Factory](/en/concepts/factory) — Add or replace custom steps

## Next steps

- [React quick start](/en/getting-started/react) — Browser mode setup
- [Configuration](/en/configuration) — Full API reference

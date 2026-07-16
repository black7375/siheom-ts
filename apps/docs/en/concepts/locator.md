# locator

A locator targets an element by ARIA **role** and **accessible name** — the same information as Playwright `getByRole` or Testing Library `screen.getByRole`.

## query API

Use `query.<role>(name)`. `name` is a string or RegExp.

```ts
query.button("Sign up");
query.textbox(/email/i);
query.checkbox("Terms");
query.region("signup-form");
query.label("Email");
```

`query` supports every concrete role from aria-query plus custom roles `label` and `text`. Do not use CSS selectors, test ids, or xpath.

## Strictness

If there is no accessible name, you cannot write a test. That is intentional — it pushes accessible labels onto the UI.

```tsx
// Button text "0" becomes the accessible name
actions.click(query.button("0"))
```

## Next steps

- [actions](/en/concepts/actions) — Using locators as targets
- [assertions](/en/concepts/assertions) — Assert state via locators
- [Comparisons](/en/comparisons) — Locators vs Playwright and Testing Library

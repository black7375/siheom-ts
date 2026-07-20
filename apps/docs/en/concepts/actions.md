# actions

An **action** step describes user behavior as data. `actions.*` from `@siheom/react` builds step objects; the interpreter runs them in a real browser.

## Built-in actions

| API | Role |
| --- | --- |
| `actions.click(target)` | Click |
| `actions.dblclick(target)` | Double-click |
| `actions.fill(target, text)` | Focus → clear → type |
| `actions.type(target, text)` | Focus → type without clearing |
| `actions.tab(target)` | Assert focus, then Tab |
| `actions.upload(target, file)` | Upload a file |
| `actions.hover(target)` | Hover the pointer |
| `actions.dragAndDrop(source, target)` | Drag source onto target |

```tsx
actions.click(query.button("Sign up"))
actions.fill(query.textbox(/email/i), "test@test.com")
```

`target` is a [locator](/en/concepts/locator). Do not add `await` in the test body.

## Custom actions

Team-specific flows register via [Factory](/en/concepts/factory) `extendSiheom`:

```ts
extendSiheom(base, {
  actions: {
    selectAccount: async (target, account) => { /* ... */ },
  },
});
```

## Next steps

- [actions API](/en/configuration/actions) — Full list and signatures
- [assertions](/en/concepts/assertions) — Expected state
- [Example: SignUpForm](/en/examples/signup-form) — fill / click flow

# actions API

Every action returns a step object `(target: Locator, ...args)`. `target` is a [locator](/en/concepts/locator).

## List

| API | Args | Role |
| --- | --- | --- |
| `actions.click(target)` | — | `userEvent.click` |
| `actions.dblclick(target)` | — | `userEvent.dblClick` |
| `actions.fill(target, text)` | `text: string` | Clear, then type |
| `actions.type(target, text)` | `text: string` | Type without clearing |
| `actions.tab(target)` | — | Assert focus, then Tab |
| `actions.upload(target, file)` | `file: File` | Upload a file |

## Examples

```tsx
actions.click(query.button("Sign up"))
actions.fill(query.textbox(/password/i), "secret123456")
actions.upload(query.button("Choose file"), file)
```

## Custom actions

```ts
extendSiheom(base, {
  actions: {
    selectAccount: async (target, account: string) => {
      // implementation
    },
  },
});
```

New keys via `extendSiheom`; replace existing keys with `overrideSiheom`. See [Factory](/en/concepts/factory).

## Next steps

- [actions concept](/en/concepts/actions)
- [assertions API](/en/configuration/assertions)

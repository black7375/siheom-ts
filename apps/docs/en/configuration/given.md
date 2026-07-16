# given API

## `@siheom/react`

| API | Role |
| --- | --- |
| `given.render(element)` | Mount a React component in a real browser |

```tsx
given.render(<Counter />)
given.render(<SignUpForm signUpMember={handler} />)
```

`element` is a `ReactElement`. For providers, use the `extendSiheom` pattern in [given](/en/concepts/given).

## `@siheom/core`

`defaultGivens.render` is what `@siheom/react` uses. Add custom givens via the factory registry.

## Next steps

- [given concept](/en/concepts/given)
- [actions API](/en/configuration/actions)

# assertions

An **assertion** step describes expected state as data. On failure you get a [structured report](/en/getting-started/react) with logs and an accessibility snapshot.

## Common assertions

| API | Role |
| --- | --- |
| `assertions.visible(target)` | Element is visible |
| `assertions.checked(target)` | Checked |
| `assertions.errormessage(target, text)` | Accessible error message |
| `assertions.a11ySnapshot(target, path)` | Accessibility tree file snapshot |
| `assertions.tableSnapshot(target, path)` | Table markdown snapshot |

Negated assertions use `assertions.not.*` (`not.visible`, `not.checked`, …).

```tsx
assertions.visible(query.button("2"))
assertions.errormessage(query.textbox(/email/i), "Invalid email format")
assertions.a11ySnapshot(query.region("signup-form"), "signup-form-initial.snap")
```

## Accessibility snapshots

`a11ySnapshot` compares a **semantic accessibility tree** to a file — not HTML. See [Accessibility snapshot](/en/concepts/a11y-snapshot).

## Custom assertions

Add to the assertion registry via [Factory](/en/concepts/factory) `extendSiheom`.

## Next steps

- [assertions API](/en/configuration/assertions) — Full list
- [Example: SignUpForm](/en/examples/signup-form) — errormessage and snapshots
- [Message map](/en/configuration/messages) — Failure-report headers

# What is siheom?

A Siheom test describes user behavior and expectations as **data**. An interpreter (`runSiheom`) runs that data in order in a real browser.

## What is a Siheom test?

A test is not a chain of imperative API calls — it is a list of `given`, `action`, and `assert` step objects.

```tsx
return runSiheom(
  given.render(<SignUpForm />),
  actions.fill(query.textbox(/email/i), "test@test.com"),
  actions.click(query.button("Sign up")),
  assertions.visible(query.heading("Welcome aboard")),
);
```

## Why we built siheom

### `await` fatigue and failure tracking

Testing Library and Playwright Test repeat `await` on every step. An earlier siheom (2.0) used `await query.button("OK").click()` too — failures were hard to trace and stacks got mangled inside wrappers.

3.0 writes tests as **data**. Do not use `await` in the test body; `return runSiheom(...)` and let the interpreter run. On failure, a [structured report](/en/getting-started/react) shows how far execution got.

### Accessibility at the center

`query` uses ARIA **role** and **accessible name** only — not CSS selectors, test ids, or DOM paths. That is the same **shared language** screen readers use, so tests survive button moves and class renames.

On failure, siheom shows an [accessibility snapshot](/en/concepts/a11y-snapshot) instead of an HTML dump or screenshot — easier for humans and cheaper in tokens for AI agents.

### Constraints for consistency

siheom **restricts** locators to role + name. It is less flexible than Playwright or Testing Library selectors, but the whole team names elements the same way. UI without accessible names must be fixed before you can write a test.

### Custom steps made easy

Repeated flows (account pickers, custom fill, …) register in the [factory](/en/concepts/factory) via `extendSiheom`. They reuse the same step-object shape as built-ins — unlike Playwright page objects or ad hoc TL helpers.

### Real browser execution

siheom runs UI in a real browser through vitest **browser mode** (Chromium, etc.). jsdom and happy-dom are not recommended. Layout, events, and focus match production more closely.

### Error messages

Step failures combine execution logs, the original Testing Library error, and an accessibility snapshot in one `Error`. Section headers are customizable via the [message map](/en/configuration/messages).

```text
[Logs]

click!      : button "Sign up"
fill!       : textbox "Email" with "test@test.com"

[Original Error Message]

Unable to find an accessible element with the role "heading" ...

[A11y Snapshot]

- textbox "Email": test@test.com
- button "Sign up"
```

## Highlights

- **[Data-first](/en/concepts)** — given / action / assert step arrays
- **[Locators](/en/concepts/locator)** — role + accessible name
- **[Accessibility snapshots](/en/concepts/a11y-snapshot)** — semantic tree assertions
- **[Factory extension](/en/concepts/factory)** — `extendSiheom` / `overrideSiheom`

## Package layout

| Package | Role |
| --- | --- |
| `@siheom/core` | Interpreter, factory, default actions/assertions |
| `@siheom/react` | React `given.render`, pre-bound `runSiheom` / `actions` / … |
| `@siheom/vue` | Vue `given.render` |
| `@siheom/svelte` | Svelte `given.render` |
| `@siheom/angular` | Angular `given.render` |
| `@siheom/qwik` | Qwik `given.render` |
| `@siheom/react-native` | `given.render` and RN accessibility queries on React Native Testing Library |

siheom core does not know how to paint UI. A framework package provides **`given.render`**. See [given](/en/concepts/given).

Two experimental packages build on core as well: `@siheom/ime`, which emulates Hangul IME composition, and `@siheom/vitest-browser-react`, a locator-based render on top of `vitest-browser-react`.

## Next steps

- [Installation](/en/getting-started/install) — Packages and browser mode deps
- [React quick start](/en/getting-started/react) — First test
- [Comparisons](/en/comparisons) — Testing Library, Playwright, Cypress

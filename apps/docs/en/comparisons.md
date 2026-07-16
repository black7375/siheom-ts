# Comparisons

siheom is for teams already comfortable with Testing Library and Playwright. It runs on Testing Library, shares Playwright's locator philosophy, but writes tests as **data** and forbids `await` in the test body.

## Compared to Testing Library alone

The same test in Testing Library repeats `await` and queries on every step. siheom uses the same role and name via `query`, but the interpreter owns execution and failure reports.

Testing Library:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Counter } from "./Counter";

it("increments the counter", async () => {
  const user = userEvent.setup();
  render(<Counter />);
  await user.click(screen.getByRole("button", { name: "0" }));
  await user.click(screen.getByRole("button", { name: "1" }));
  expect(await screen.findByRole("button", { name: "2" })).toBeInTheDocument();
});
```

siheom:

```tsx
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { Counter } from "./Counter";

it("increments the counter", () => {
  return runSiheom(
    given.render(<Counter />),
    actions.click(query.button("0")),
    actions.click(query.button("1")),
    assertions.visible(query.button("2")),
  );
});
```

Differences:

- **No `await` in the test body**: The interpreter handles `waitFor`.
- **Failure reports**: Logs and an accessibility snapshot in one message.
- **Custom steps**: Add actions and assertions via `extendSiheom`. In Testing Library you compose helper functions yourself.
- **Locators**: `query` uses the same information as `getByRole`. Almost nothing new to learn.

## Compared to Playwright Test

Both siheom and Playwright Test use **role + accessible name** locators. The difference is how you express tests and extend behavior.

| | siheom | Playwright Test |
| --- | --- | --- |
| Test shape | Data (step array) | Imperative `await` |
| Runner | vitest browser mode | Playwright runner |
| Custom steps | Factory registries (`extendSiheom`) | Fixtures, helpers, page objects |
| Strictness | Accessible name required; CSS / test id discouraged | More flexible locator API |
| E2E | **Not supported yet** (Playwright-based E2E may come later) | Multi-page, network E2E |

Playwright Test writes `await page.getByRole(...).click()` chains. siheom writes `actions.click(query.button("Save"))` as step objects and does not use `await` in the test function. To fold a repeated flow into one step, siheom registers it in the factory; Playwright maintains page objects or helpers separately.

## Compared to Cypress

Cypress uses imperative chains (`cy.get(...).click()`) and plugins. siheom uses data steps and factory registries for a similar goal in a different shape. Cypress is strong at real-browser E2E; siheom focuses on component and integration tests under vitest browser mode.

## Relation to E2E

siheom **does not support multi-page E2E today.** Running component and integration tests in a real browser is the 1.0 scope. Playwright-based E2E may be added later.

For full-app flows (login through checkout) today, use Playwright or Cypress E2E. siheom fills the layer below—UI pieces and integration—quickly and with accessibility at the center.

## When siheom is not a fit

- **Multi-page E2E needed now** — Playwright / Cypress E2E
- **Pixel-level visual regression** — Percy, Chromatic, Playwright screenshot compare
- **Data steps or no-`await` style does not fit the team** — Use Testing Library or Playwright directly
- **jsdom / happy-dom only** — siheom recommends real browser execution

## At a glance

| Lens | siheom | Testing Library | Playwright / Cypress |
| --- | --- | --- | --- |
| Test shape | Data (steps) | Imperative API | Imperative / scenarios |
| Environment | vitest browser mode (real browser) | jsdom, etc. (your setup) | Real browser E2E |
| Locators | Role + accessible name | `getByRole`, etc. | `getByRole`, etc. |
| `await` | Forbidden in test body | Per step | Per step |
| A11y snapshots | Built-in assertion | Separate tooling | Limited |
| Failure reports | Logs + a11y snapshot | Default error message | Screenshot-centric |
| Custom steps | Factory registries | Helper functions | Fixtures / plugins |
| E2E | Not yet (may come later) | N/A | Core strength |

## Next steps

- [What is siheom?](/en/intro) — Why we built it
- [React quick start](/en/getting-started/react) — Browser mode setup
- [Factory](/en/concepts/factory) — Add custom steps

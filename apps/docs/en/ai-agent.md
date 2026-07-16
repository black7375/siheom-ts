# AI agents

Siheom tests are step objects plus accessibility snapshots — a shape that suits AI agents reading failures and proposing fixes.

## llms.txt

[`/llms.txt`](/llms.txt) on the docs site summarizes APIs, factory, locators, and failure-report format. Add that URL to agent context or paste the file contents.

Repo root [`CONTEXT.md`](https://github.com/twinstae/siheom-ts/blob/main/CONTEXT.md) defines **Siheom test**, **runtime**, **factory**, **message map**, and related terms. Align siheom vocabulary with that file.

## Installing the skill

siheom 1.0 ships a **Skills package** for writing good tests, distributed via a skills registry following [mattpocock/skills](https://github.com/mattpocock/skills).

When published, install roughly like:

```bash
npx skills add twinstae/siheom-ts
```

The skill guides agents to:

- Use `return runSiheom(...)` without `await` in the test body
- Use only `query.<role>(name)` locators (no CSS or test id)
- Read `[Logs]` and `[A11y Snapshot]` first on failure
- Add custom flows via `extendSiheom`

Until the package is public, provide [`llms.txt`](/llms.txt), [What is siheom?](/en/intro), and [React quick start](/en/getting-started/react) as context.

## Why agents fit siheom

- **Data steps**: Easy to pinpoint which step to edit in the array.
- **A11y snapshots**: Role, name, and state — not full HTML — lower token cost.
- **Structured failure reports**: Logs show how far execution got.

## Next steps

- [Accessibility snapshot](/en/concepts/a11y-snapshot) — Snapshot format
- [Example: SignUpForm](/en/examples/signup-form) — errormessage and region snapshots
- [Factory](/en/concepts/factory) — Custom steps

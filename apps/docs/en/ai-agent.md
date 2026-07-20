# AI agents

Siheom tests are step objects plus accessibility snapshots — a shape that suits AI agents reading failures and proposing fixes.

## llms.txt

[`/llms.txt`](/llms.txt) on the docs site summarizes APIs, factory, locators, **headless UI notes**, and failure-report format. Add that URL to agent context or paste the file contents.

For forms with headless UI (Radix, React Aria, Ariakit, Ark UI), also provide [Headless UI guide](/en/guides/headless-components) and repo skill [`HEADLESS.md`](https://github.com/twinstae/siheom-ts/blob/main/.claude/skills/siheom-frontend-test/HEADLESS.md).

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
- For timer UI: `withFakeTimers` + `effect.elapsed` + `query.timer` / `textContent` (no global `vi.useFakeTimers`)
- Read `[Logs]` and `[A11y Snapshot]` first on failure
- Headless UI: match snapshot role (`query.label` vs `query.combobox`); no keyboard workarounds — [guide](/en/guides/headless-components)
- Add custom flows via `extendSiheom`
- When wrapping render with `overrideSiheom`, keep `effects` and `fakeTimerScope` on the base

Until the package is public, provide [`llms.txt`](/llms.txt), [What is siheom?](/en/intro), and [React quick start](/en/getting-started/react) as context.

## Why agents fit siheom

- **Data steps**: Easy to pinpoint which step to edit in the array.
- **A11y snapshots**: Role, name, and state — not full HTML — lower token cost.
- **Structured failure reports**: Logs show how far execution got.

## Next steps

- [Headless UI guide](/en/guides/headless-components) — Select queries, dialog+form, per-library notes
- [Accessibility snapshot](/en/concepts/a11y-snapshot) — Snapshot format
- [Example: Countdown](/en/examples/countdown) — withFakeTimers and effect.elapsed
- [Example: SignUpForm](/en/examples/signup-form) — errormessage and region snapshots
- [Factory](/en/concepts/factory) — Custom steps

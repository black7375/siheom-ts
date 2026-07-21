# Slate placeholder Hangul — capture fixtures

| Directory         | Meaning                    |
| ----------------- | -------------------------- |
| `android-chrome/` | Android Chrome + Slate/plain |

| File | Notes |
| ---- | ----- |
| (pending) | Re-capture after Logger fix — see below |

## Capture targets (Logger)

| Scenario id | Field | Purpose |
| ----------- | ----- | ------- |
| `slate-ac-first-hangul-placeholder` | Slate `Editable` + placeholder | [Slate #5989](https://github.com/ianstormtaylor/slate/issues/5989) repro |
| `slate-ac-plain-control` | plain `<textarea>` | Baseline — Gboard should compose `가` normally |

**Do not use** Slate without placeholder as control on Android: empty Slate editor blocks IME entirely (Slate #4693 class), not a working comparison.

Storybook: **IME / Slate**.

# Slate placeholder Hangul — capture fixtures

| Directory         | Meaning                    |
| ----------------- | -------------------------- |
| `android-chrome/` | Android Chrome + Slate/plain |

| File | Notes |
| ---- | ----- |
| `broken-가-placeholder.json` | Slate + placeholder: `가` → `ㄱㄱㅏㄱㅏ` ([Slate #5989](https://github.com/ianstormtaylor/slate/issues/5989)) |
| `fixed-가-plain-control.json` | Plain textarea: `가` intact (second composition session after clear) |

Emulator profiles: `android-chrome-slate-placeholder-broken` / `android-chrome-slate-plain-control` in `@siheom/ime`.

Storybook: **IME / Slate**. Scenario ids: `slate-ac-first-hangul-placeholder` / `slate-ac-plain-control`.

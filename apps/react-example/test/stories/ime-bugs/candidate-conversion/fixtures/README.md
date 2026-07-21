# Candidate conversion capture fixtures

| Directory                   | Meaning                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| `user-event/`               | `@testing-library/user-event` synthetic traces (`userEventTraces.test.tsx` snapshot)         |
| `macos-chrome-pinyin/`      | OS capture slot: macOS + Chrome + Pinyin (`profileId`: `macos-chrome-pinyin`)                |
| `macos-chrome-japanese/`    | OS capture slot: macOS + Chrome + Japanese (`profileId`: `macos-chrome-japanese`)            |
| `macos-chrome-apple/`       | OS capture slot: macOS + Chrome + Apple IME (`profileId`: `macos-chrome-apple`)              |
| `linux-ibus-pinyin-chrome/` | OS capture slot: Linux + Chrome + ibus-pinyin (`profileId`: `linux-chrome-ibus-pinyin`)     |

Scenario ids are defined in [`scenarios.ts`](../scenarios.ts). OS captures use **broken / fixed** pairs per scenario (same pattern as `enter-submit/`).

| File pattern | `scenarioId` in JSON | Notes |
| ------------ | -------------------- | ----- |
| `broken-pinyin-raw-enter.json` | `pinyin-raw-enter-broken` | Pinyin + `hello` + Enter (no candidate pick) |
| `fixed-pinyin-raw-enter.json` | `pinyin-raw-enter-fixed` | Same IME steps; fixed UI must not send |
| `broken-pinyin-candidate-enter.json` | `pinyin-candidate-enter-broken` | `nihao` → 你好 + Enter |
| `fixed-pinyin-candidate-enter.json` | `pinyin-candidate-enter-fixed` | Same IME steps |
| `broken-japanese-romaji.json` | `japanese-romaji-broken` | `nihongo` → 日本語 + Enter |
| `fixed-japanese-romaji.json` | `japanese-romaji-fixed` | Same IME steps |
| `broken-korean-hanja.json` | `korean-hanja-broken` | Hangul → 金 + Enter |
| `fixed-korean-hanja.json` | `korean-hanja-fixed` | Same IME steps |

OS profile JSON files are **empty shells** (`events: []`) — paste Storybook captures into the matching `broken-*` / `fixed-*` file.

User-event JSON is **not** hand-edited; run `userEventTraces.test.tsx` (or `bun run test -- -u` to refresh snapshots).

Storybook: **IME / Candidate Conversion Chat** — select scenario + broken/fixed mode before capture.

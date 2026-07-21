# Candidate conversion capture fixtures

| Directory                   | Meaning                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| `user-event/`               | `@testing-library/user-event` synthetic traces (`userEventTraces.test.tsx` snapshot)         |
| `macos-chrome-pinyin/`      | OS capture slot: macOS + Chrome + Pinyin (`profileId`: `macos-chrome-pinyin`)                |
| `macos-chrome-japanese/`    | OS capture slot: macOS + Chrome + Japanese (`profileId`: `macos-chrome-japanese`)            |
| `macos-chrome-apple/`       | OS capture slot: macOS + Chrome + native Hanja (`profileId`: `macos-chrome-apple`)           |
| `linux-ibus-pinyin-chrome/` | OS capture slot: Linux + Chrome + ibus-pinyin (`profileId`: `linux-chrome-ibus-pinyin`)     |

Scenario filenames match `scenarioId` in [`scenarios.ts`](../scenarios.ts).

| File                        | Notes                                                   |
| --------------------------- | ------------------------------------------------------- |
| `pinyin-raw-enter.json`     | Pinyin + Latin `hello` + Enter (no candidate pick)      |
| `pinyin-candidate-enter.json` | `nihao` → 你好 + Enter confirm                        |
| `japanese-romaji.json`      | `nihongo` → 日本語 + Enter confirm                      |
| `korean-hanja.json`         | Hangul → 金 (Hanja conversion) + Enter confirm          |

OS profile JSON files are **empty shells** (`events: []`) — paste Storybook captures from **IME / Candidate Conversion Chat**.

User-event JSON is **not** hand-edited; run `userEventTraces.test.tsx` (or `bun run test -- -u` to refresh snapshots).

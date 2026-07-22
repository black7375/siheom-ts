# TipTap IME capture fixtures (#4108 / #6825)

Storybook: **IME / TipTap**. Scenarios: `enter-newline` → `tiptap-enter-김`, `list-item-start` → `tiptap-list-ime`.

| Directory                   | profileId                  | Notes                                       |
| --------------------------- | -------------------------- | ------------------------------------------- |
| `windows-chrome-ms/`        | `windows-chrome-ms`        | Windows + Chrome + MS Hangul                |
| `macos-chrome-apple/`       | `macos-chrome-apple`       | macOS + Chrome + Apple Hangul               |
| `macos-safari-apple/`       | `macos-safari-apple`       | macOS + Safari + Apple — **#6825 priority** |
| `linux-ibus-hangul-chrome/` | `linux-chrome-ibus-hangul` | Linux + Chrome + ibus-hangul                |
| `android-chrome/`           | `android-chrome`           | Android + Chrome / Gboard                   |

| File                   | Scenario                                       |
| ---------------------- | ---------------------------------------------- |
| `broken-enter-김.json` | #4108 — compose `김`, Enter during composition |
| `broken-list-ime.json` | #6825 — IME at start of first bullet list item |

## Capture

1. `bun run storybook` → **IME / TipTap**.
2. Set OS / Browser / IME to match the target folder; pick scenario toolbar.
3. Reproduce with real IME → **JSON 다운로드**.
4. Replace the empty `events: []` shell (keep `profileId` / `scenarioId`).

Empty shells are placeholders until OS capture. Do not invent events.

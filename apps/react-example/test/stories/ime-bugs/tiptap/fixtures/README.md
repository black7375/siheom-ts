# TipTap IME capture fixtures (#4108 / #6825)

Storybook: **IME / TipTap**. Scenarios: `enter-newline` → `tiptap-enter-김`, `list-item-start` → `tiptap-list-ime`.

| Directory                   | profileId                  | Notes                                                                     |
| --------------------------- | -------------------------- | ------------------------------------------------------------------------- |
| `windows-chrome-ms/`        | `windows-chrome-ms`        | Windows + Chrome + MS Hangul (`chromium-duplicate` Enter)                 |
| `windows-chrome-ngs/`       | `windows-chrome-ngs`       | Windows + Chrome + 날개셋 (`chromium-duplicate`, same Enter facet as MS)  |
| `windows-firefox-ms/`       | `windows-firefox-ms`       | Windows + Firefox + MS Hangul (`webkit` Enter: compositionend → Enter 13) |
| `macos-chrome-apple/`       | `macos-chrome-apple`       | macOS + Chrome + Apple Hangul                                             |
| `macos-safari-apple/`       | `macos-safari-apple`       | macOS + Safari + Apple — **#6825 priority**                               |
| `linux-ibus-hangul-chrome/` | `linux-chrome-ibus-hangul` | Linux + Chrome + ibus-hangul                                              |
| `android-chrome/`           | `android-chrome`           | Android + Chrome / Gboard                                                 |

| File                   | Scenario                                         |
| ---------------------- | ------------------------------------------------ |
| `broken-enter-김.json` | #4108 — compose Hangul, Enter during composition |
| `broken-list-ime.json` | #6825 — IME at start of first bullet list item   |

## Capture notes

1. Prefer **시나리오** toolbar (`list-item-start` seeds a bullet). Typing `- ` by hand confuses TipTap and can leave `tiptapDebug.final` null if the editor remounts mid-capture.
2. Download JSON after the scenario; replace the empty `events: []` shell.
3. Emulator goldens for Windows Enter / continuous Hangul also live under `packages/ime/fixtures/windows-*`.

## Windows OS fills (2026-07-22)

| Profile              | enter                             | list-ime                                                                     |
| -------------------- | --------------------------------- | ---------------------------------------------------------------------------- |
| `windows-chrome-ms`  | filled (syllable stopped at `가`) | empty — re-capture                                                           |
| `windows-chrome-ngs` | filled (`김`)                     | filled (`tiptapDebug.final` was null on device — logger caches snapshot now) |
| `windows-firefox-ms` | filled (`김`)                     | filled (manual `- ` then Hangul; prefer toolbar seed next time)              |

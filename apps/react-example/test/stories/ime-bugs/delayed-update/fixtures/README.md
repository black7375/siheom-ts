# Delayed controlled update — capture fixtures

| Directory                   | Meaning                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| `user-event/`               | `@testing-library/user-event` synthetic traces (Vitest snapshot)                             |
| `linux-ibus-hangul-chrome/` | Real OS IME captures: Linux + Chrome + ibus-hangul (`profileId`: `linux-chrome-ibus-hangul`) |

| File                 | Notes                                                                 |
| -------------------- | --------------------------------------------------------------------- |
| `broken-김태희.json` | OS: 김태희 → `ㄱㅣㅁㅌㅐㅎㅡㅣ` (no `compositionend`; stale writeback) |
| `fixed-김태희.json`  | OS: 김태희 intact with sync controlled updates                       |

Storybook: **IME / Delayed Controlled Update**. Emulator coverage: `DelayedControlledField.ime.test.tsx`.
User-event snapshots: `userEventTraces.test.tsx`.

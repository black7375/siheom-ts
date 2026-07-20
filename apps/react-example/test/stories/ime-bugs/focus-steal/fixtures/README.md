# Focus-steal capture fixtures

| Directory                   | Meaning                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| `user-event/`               | `@testing-library/user-event` synthetic traces (Vitest snapshot)                             |
| `linux-ibus-hangul-chrome/` | Real OS IME captures: Linux + Chrome + ibus-hangul (`profileId`: `linux-chrome-ibus-hangul`) |

| File                 | Notes                                              |
| -------------------- | -------------------------------------------------- |
| `broken-hangul.json` | OS: 김태희 → `ㄱㅣㅁㅌㅐㅎㅡㅣ` (DOM focus bounce) |
| `fixed-hangul.json`  | OS: 김태희 intact after virtual-focus fix          |

Storybook: **IME / Focus Steal Combobox**. Emulator coverage: `FocusStealCombobox.ime.test.tsx`.

# Focus-steal capture fixtures

| Directory                   | Meaning                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| `user-event/`               | `@testing-library/user-event` synthetic traces (Vitest snapshot)                             |
| `linux-ibus-hangul-chrome/` | Real OS IME captures: Linux + Chrome + ibus-hangul (`profileId`: `linux-chrome-ibus-hangul`) |

| File                              | Notes                                                                 |
| --------------------------------- | --------------------------------------------------------------------- |
| `broken-hangul.json`              | OS: 김태희 → `ㄱㅣㅁㅌㅐㅎㅡㅣ` (DOM focus bounce)                     |
| `fixed-hangul.buggy-김ㅐㅢ.json`  | Old “fixed” that still bounced on `compositionend` / controlled value |
| `fixed-hangul.json`               | Re-capture after virtual-focus fix — expect final `김태희`            |

Storybook: **IME / Focus Steal Combobox**. Regenerate `user-event/` via `userEventTraces.test.tsx`.

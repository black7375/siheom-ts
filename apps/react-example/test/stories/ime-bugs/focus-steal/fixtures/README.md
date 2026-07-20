# Focus-steal capture fixtures

| Directory                   | Meaning                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| `user-event/`               | `@testing-library/user-event` synthetic traces (Vitest snapshot)                             |
| `linux-ibus-hangul-chrome/` | Real OS IME captures: Linux + Chrome + ibus-hangul (`profileId`: `linux-chrome-ibus-hangul`) |

| File                 | Mode   | Status                                                                 |
| -------------------- | ------ | ---------------------------------------------------------------------- |
| `broken-hangul.json` | broken | OS capture present — 김태희 → `ㄱㅣㅁㅌㅐㅎㅡㅣ` (composition aborted) |
| `fixed-hangul.json`  | fixed  | Draft (`events: []`) — replace after Storybook capture                 |

Storybook: **IME / Focus Steal Combobox**. Regenerate `user-event/` via `userEventTraces.test.tsx`.

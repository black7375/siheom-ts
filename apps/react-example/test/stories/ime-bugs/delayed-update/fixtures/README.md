# Delayed controlled update — capture fixtures

| Directory                   | Meaning                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| `user-event/`               | `@testing-library/user-event` / emulator synthetic traces (Vitest)                           |
| `linux-ibus-hangul-chrome/` | Real OS IME captures: Linux + Chrome + ibus-hangul (`profileId`: `linux-chrome-ibus-hangul`) |

| File                 | Notes                                                         |
| -------------------- | ------------------------------------------------------------- |
| `broken-김태희.json` | Stale React `value` clobbers preedit — final value ≠ `김태희` |
| `fixed-김태희.json`  | Sync setState during compose — final value `김태희`           |

Storybook: **IME / Delayed Controlled Update**. Emulator coverage: `DelayedControlledField.ime.test.tsx`.

# Delayed controlled update — capture fixtures

| Directory                   | Meaning                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| `linux-chrome-ibus-hangul/` | OS IME capture slots (type 김태희 quickly into DelayedControlledField)  |
| `emulator/`                 | Emulator traces via `createImeActions({ settle: "macrotask", deferredUpdateRace: true })` |

| File               | Notes                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| `broken-김태희.json` | Stale React `value` clobbers preedit — final value ≠ `김태희`         |
| `fixed-김태희.json`  | Sync setState during compose — final value `김태희`                   |

Storybook: **IME / Delayed Controlled Update**. Emulator coverage: `DelayedControlledField.ime.test.tsx`.

`events: []` drafts are placeholders — paste JSON from the logger after a real OS or emulator run.

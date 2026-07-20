# MaxLength capture fixtures

| File | Notes |
| ---- | ----- |
| `broken-7of6.json` | maxLength=6, type 7 Hangul syllables; value may exceed 6 during composition |
| `fixed-7of6.json` | same keystrokes with fixed clamp UI; final value length ≤ 6 |

Place captures under `<profileId>/` (e.g. `linux-ibus-hangul-chrome/`).

Emulator tests live in `MaxLengthField.ime.test.tsx` until OS golden critical fields are committed.

# Enter-submit capture fixtures

| Directory                   | Meaning                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| `macos-safari-apple/`       | Draft slots for Safari (same event order as Linux ibus in practice)                          |
| `linux-ibus-hangul-chrome/` | Real OS IME captures: Linux + Chrome + ibus-hangul (`profileId`: `linux-chrome-ibus-hangul`) |

Linux Chrome + ibus-hangul matches the Safari bug class (not 229-first). Emulator profile
`linux-chrome-ibus-hangul` uses the `webkit` Enter facet for that reason.

| File                   | Notes                                    |
| ---------------------- | ---------------------------------------- |
| `broken-김-enter.json` | Confirm Enter false-submits (submit 1)   |
| `fixed-김-enter.json`  | Same events; UI must swallow first Enter |

229-first Chromium order remains available as profile id `chromium-enter-229`.

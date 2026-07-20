# Enter-submit capture fixtures

| Directory             | Meaning                                      |
| --------------------- | -------------------------------------------- |
| `user-event/`         | Synthetic user-event traces (optional)       |
| `macos-safari-apple/` | Prefer real Safari + Apple Hangul captures   |
| `emulator/`           | Optional dumps from createImeActions profiles |

Emulator reproduction does **not** require Safari: tests use `createImeActions({ profile: "macos-safari" })`.

| File                    | Notes                                      |
| ----------------------- | ------------------------------------------ |
| `broken-김-enter.json`  | Mid-composition Enter under broken SearchField |
| `fixed-김-enter.json`   | Same under fixed (no false submit)         |

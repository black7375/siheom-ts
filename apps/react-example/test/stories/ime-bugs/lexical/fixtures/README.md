# Lexical Android Firefox composition break — capture fixtures

| Directory          | Meaning                                              |
| ------------------ | ---------------------------------------------------- |
| `android-firefox/` | Android Firefox + Lexical contenteditable            |
| `linux-firefox/`   | Linux Firefox + Lexical (syllables commit correctly) |
| `linux-chrome/`    | Linux Chrome + Lexical (syllables commit correctly)  |

| File                 | Notes                                                                              |
| -------------------- | ---------------------------------------------------------------------------------- |
| `broken-가나다.json` | AF pre-fix: `가나다` → `ㄱㅏ나다` — premature `compositionend` after first jamo    |
| `fixed-가나다.json`  | AF post-fix v2 plugin: visible `가나다`; single composition session (`ㄱ→가→간→…`) |

Storybook: **IME / Lexical**. Scenario id: `lexical-af-continuous-hangul` (broken) / `lexical-af-continuous-hangul-fixed` (fixed).

Emulator: `android-firefox-contenteditable-broken` / `linux-firefox-contenteditable-fixed` profiles in `@siheom/ime`; device golden replay via `replayGoldenEvents` in `LexicalLogger.ime.test.tsx`.

Related: [Lexical #6377](https://github.com/facebook/lexical/issues/6377), `docs/research/lexical-android-firefox-composition.md`.

# Lexical Android Firefox composition break — capture fixtures

| Directory          | Meaning                                                       |
| ------------------ | ------------------------------------------------------------- |
| `android-firefox/` | Android Firefox + Lexical contenteditable (broken jamo split) |
| `linux-firefox/`   | Linux Firefox + Lexical (syllables commit correctly)          |
| `linux-chrome/`    | Linux Chrome + Lexical (syllables commit correctly)           |

| File                 | Notes                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `broken-가나다.json` | AF: `가나다` → `ㄱㅏ나다` — premature `compositionend` after first jamo, no syllable merge |
| `fixed-가나다.json`  | LF/LC: `가나다` intact with syllable-boundary `compositionend` → `compositionstart`        |

Storybook: **IME / Lexical**. Scenario id: `lexical-af-continuous-hangul`.

Emulator: `android-firefox-lexical` profile in `@siheom/ime`; see `LexicalLogger.ime.test.tsx`.

Related: [Lexical #6377](https://github.com/facebook/lexical/issues/6377), `docs/research/lexical-android-firefox-composition.md`.

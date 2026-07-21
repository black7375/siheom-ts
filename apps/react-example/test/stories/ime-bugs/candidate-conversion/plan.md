# Hanja autocomplete vs IME candidate keys

## Goal

1. **Key conflict**: macOS 한자 변환(Option+Enter) 후보 키(방향키·숫자·Enter)를
   자동완성 combobox가 가로채지 않게 한다.
2. **Chrome append 보정**: macOS Chrome은 Hanja 변환 시 한글을 대체하지 않고 append한다
   (김 → 김金). fixed는 IME 의도대로 직전에 남은 한글을 지워 金으로 맞춘다.

## Behaviors

- [x] `mode="broken"`: combobox steals Arrow/Enter/digit; no 김金 strip
- [x] `mode="fixed"`: defer combobox keys while composing / 229 / altKey
- [x] `mode="fixed"`: `stripHangulBeforeHanja` only on Hanja **compositionend** (김金 → 金; never on Option+Enter start)
- [x] Unit tests for strip helper + Chrome append replay
- [x] `typeHanja` + fixed + macos-chrome-apple: first syllable yields stripped `金`
- [x] `typeHanja` + fixed + macos-chrome-apple: full name yields `金泰熙`
- [x] `typeHanja` + broken + macos-chrome-apple: combobox steals conversion Enter (`마지막 combobox 선택` visible)

## Why 김金 happens (browser)

Chromium ignores macOS IME `replacementRange` on web inputs, so Option+Enter does:

```
compositionend "김" → compositionstart → insertCompositionText "金" → value "김金"
```

Safari/native apps replace. Toss/당근 etc. show the same Chrome append.
**fixed = app compensates** by deleting the leftover Hangul when Hanja appears.

## Storybook

`bun run storybook` → **IME / Hanja Autocomplete Conflict**

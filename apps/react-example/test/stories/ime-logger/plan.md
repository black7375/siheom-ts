# IME event logger (Storybook capture tool)

## Goal

Storybook에서 실제 IME로 입력하며 `keydown`/`composition*`/`beforeinput`/`input` 등을 기록하고, JSON을 복사·다운로드해 골든 트레이스로 넘긴다.

## Behaviors

- [x] `serializeImeEvent` turns a browser event into a stable JSON record (type, key, code, keyCode, isComposing, inputType, data, value snapshot)
- [x] `buildImeTrace` wraps events with profile metadata (`os`, `browser`, `ime`, `profileId`, `capturedAt`)
- [x] Story shows a labeled text field; typing appends serialized events to a live log
- [x] User can set `os` / `browser` / `ime` (and see derived `profileId`)
- [x] Copy JSON and Download JSON export the full trace
- [x] Clear empties the log and the field

# IME event logger (Storybook capture tool)

## Goal

Storybook에서 실제 IME로 입력하며 `keydown`/`composition*`/`beforeinput`/`input` 등을 기록하고, JSON을 복사·다운로드해 골든 트레이스로 넘긴다.
타자연습처럼 **시나리오별 지시**로 현실적인 케이스를 캡처하고, `@testing-library/user-event`가 같은 문자열에서 내는 이벤트는 픽스처 스냅샷으로 남겨 대비한다.

## Behaviors

- [x] `serializeImeEvent` turns a browser event into a stable JSON record (type, key, code, keyCode, isComposing, inputType, data, value snapshot)
- [x] `buildImeTrace` wraps events with profile metadata (`os`, `browser`, `ime`, `profileId`, `capturedAt`)
- [x] Story shows a labeled text field; typing appends serialized events to a live log
- [x] User can set `os` / `browser` / `ime` (and see derived `profileId`)
- [x] Copy JSON and Download JSON export the full trace
- [x] Clear empties the log and the field
- [x] Capture scenarios describe realistic drills (continuous Hangul, mixed EN/KO, mid backspace, arrow then edit)
- [x] Logger UI lists scenarios with step instructions and expected final value; selecting one clears the log
- [x] Trace JSON includes `scenarioId` and `source` (`os-ime` | `user-event`)
- [x] Vitest records user-event event traces for each scenario into committed fixtures under `fixtures/user-event/`

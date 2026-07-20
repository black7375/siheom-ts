# Delayed controlled update (stale setState mid-composition)

## Goal

React controlled input에서 `setState`가 **한 박자 늦게** 반영되면, IME가 이미 다음 preedit로 간 뒤
오래된 `value` prop이 DOM을 덮어써 Hangul 조합이 깨진다.
영어는 composition이 없어 잘 안 보이던 클래스다 (구 프레임워크 async batch → React 18 이슈와 유사).

## Behaviors

- [x] `mode="broken"`: leading-snapshot `setTimeout(0)` + `flushSync` — 빠른 한글 입력 시 조합이 깨짐
- [x] `mode="fixed"`: 조합 중 동기 `setValue` — `김태희` 유지
- [x] `composeHangul(..., { settle: "macrotask", deferredUpdateRace: true })` / `createImeActions({ … })`로 에뮬 재현
- [x] Storybook logger (`IME/Delayed Controlled Update`) for OS capture under delayed updates
- [x] `fixtures/` slots (`linux-ibus-hangul-chrome/`, `user-event/`)
- [x] `user-event/` Vitest file snapshots for broken/fixed 김태희
- [x] Emulator critical events / final value match OS `linux-ibus-hangul-chrome` goldens

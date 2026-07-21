# Lexical IME Logger Story (Android Firefox composition break)

## Goal

`apps/react-example`에 Lexical 최소 마운트 + `ImeCaptureShell` Logger Story를 추가해 Android Firefox 등에서 [Lexical #6377](https://github.com/facebook/lexical/issues/6377) 재현·캡처가 가능하게 한다.

## Behaviors

### Capture story (phase 1)

- [x] `LexicalLogger`가 렌더링되고 contenteditable 영역이 accessible name을 가진다
- [x] Storybook에 `IME/Lexical` Capture story가 등록된다
- [x] IME 이벤트가 로그에 기록된다 (phase1: user-event 픽스처로 검증)
- [x] 트레이스 JSON을 복사/다운로드할 수 있다 (`ImeCaptureShell` 기본 동작)
- [x] AF 캡처용 안내 문구가 표시된다

### Fixtures + emulator (phase 2)

- [x] OS 캡처 JSON이 `fixtures/`에 정리된다 (`broken-가나다` / `fixed-가나다`)
- [x] `@siheom/ime` `android-firefox-contenteditable-broken` 프로필이 등록된다
- [x] `composeHangul`이 AF contenteditable broken golden critical events와 일치한다 (`가나다` → jamo split)
- [x] `LexicalLogger.ime.test`: `android-firefox-contenteditable-broken` 프로필로 `가나다` 입력 시 정상 조합(`가나다`)이 되지 않는다

### Fix + fixed golden (phase 3)

- [x] `@siheom/ime` `linux-firefox-contenteditable-fixed` 프로필 + `contenteditable-firefox-fixed` compose mode
- [x] `composeHangul`이 LF contenteditable fixed golden critical events와 일치한다 (`가나다` intact)
- [x] `LexicalAndroidFirefoxCompositionFixPlugin`: NBSP/ZWSP sentinel `CONTROLLED_TEXT_INSERTION_COMMAND` 차단
- [x] `LexicalLogger` broken/fixed 모드 + ModeToolbar
- [x] `LexicalLogger.ime.test`: fixed + `linux-firefox-contenteditable-fixed` → fixed golden critical events on contenteditable

### Fix validation (phase 4)

- [x] Vitest UA shim (`lexicalAndroidFirefoxEnv`) so Lexical `IS_FIREFOX` matches emulator event order
- [x] `LexicalLogger.ime.test`: fixed mode + `linux-firefox-contenteditable-fixed` → editor text `가나다`
- [x] Real device: Android Firefox fixed mode → capture `android-firefox/fixed-가나다.json` (partial: visible `ㅏ나다`, first `ㄱ` lost)
- [ ] `LexicalLogger.ime.test`: replay AF `fixed-가나다.json` golden → editor text `가나다`

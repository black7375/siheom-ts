# Lexical IME Logger Story (Android Firefox composition break)

## Goal

`apps/react-example`에 Lexical 최소 마운트 + `ImeCaptureShell` Logger Story를 추가해 Android Firefox 등에서 [Lexical #6377](https://github.com/facebook/lexical/issues/6377) 재현·캡처가 가능하게 한다.

## Behaviors

- [x] `LexicalLogger`가 렌더링되고 contenteditable 영역이 accessible name을 가진다
- [x] Storybook에 `IME/Lexical` Capture story가 등록된다
- [x] IME 이벤트가 로그에 기록된다 (phase1: user-event 픽스처로 검증)
- [x] 트레이스 JSON을 복사/다운로드할 수 있다 (`ImeCaptureShell` 기본 동작)
- [x] AF 캡처용 안내 문구가 표시된다


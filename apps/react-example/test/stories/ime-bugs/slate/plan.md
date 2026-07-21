# Slate IME Logger Story (placeholder + first Hangul syllable)

## Goal

`apps/react-example`에 Slate 최소 `Editable` + placeholder on/off + `ImeCaptureShell` Logger Story를 추가해 Android Chrome 등에서 [Slate #5989](https://github.com/ianstormtaylor/slate/issues/5989) 첫 음절 깨짐을 재현·캡처한다.

## Behaviors

### Capture story (phase 1)

- [x] `SlateLogger`가 렌더링되고 contenteditable 영역이 accessible name을 가진다
- [x] Storybook에 `IME/Slate` Capture story가 등록된다
- [x] placeholder on/off 토글이 표시된다
- [x] IME 이벤트가 로그에 기록된다
- [x] 트레이스 JSON을 복사/다운로드할 수 있다 (`ImeCaptureShell` 기본 동작)
- [x] Android Chrome 캡처용 안내 문구가 표시된다

### Fixtures + emulator (phase 2 — after device capture)

- [ ] OS 캡처 JSON이 `fixtures/`에 정리된다
- [ ] `*.ime.test` (profile replay) — 캡처 이후

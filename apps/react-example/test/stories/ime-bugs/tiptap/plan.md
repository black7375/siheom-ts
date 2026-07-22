# TipTap IME Logger (#4108 Enter / #6825 list-item Safari)

## Goal

`apps/react-example`에 TipTap 최소 마운트 + `ImeCaptureShell` Logger를 추가해
[TipTap #4108](https://github.com/ueberdosis/tiptap/issues/4108) (조합 중 Enter → 음절 소실)과
[TipTap #6825](https://github.com/ueberdosis/tiptap/issues/6825) (Safari 리스트 첫 항목 IME)를
OS별로 재현·캡처하고, 트레이스로 `@siheom/ime` 프로필을 검증·확장한다.

## Behaviors

### Capture story (phase 1)

- [x] `TipTapLogger`가 렌더링되고 contenteditable 영역이 accessible name을 가진다
- [x] Storybook에 `IME/TipTap` Capture story가 등록된다
- [ ] IME 이벤트가 로그에 기록된다 (phase1: user-event 픽스처로 검증)
- [ ] 트레이스 JSON을 복사/다운로드할 수 있다 (`ImeCaptureShell` 기본 동작)
- [ ] 캡처 안내 문구가 표시된다 (`enter-newline` / `list-item-start`)

### Debug + scenarios (phase 2)

- [ ] `TipTapCompositionDebugPlugin` + snapshot이 `traceExtra.tiptapDebug`로 붙는다
- [ ] 시나리오 모드 `enter-newline` / `list-item-start` (scenarioId·시드 doc)
- [ ] `fixtures/` 빈 셸 + README (windows / macos chrome·safari / linux / android)

### OS goldens + emulator (phase 3)

- [ ] OS 캡처 JSON이 `fixtures/`에 채워진다 (`broken-enter-김` / `broken-list-ime`)
- [ ] 골든 critical path를 기존 Enter facet과 diff한다
- [ ] 필요 시에만 `@siheom/ime` TipTap 전용 profile/compose를 추가한다
- [ ] `TipTapLogger.ime.test`: broken 게이트 (프로필로 버그 재현 또는 critical match)

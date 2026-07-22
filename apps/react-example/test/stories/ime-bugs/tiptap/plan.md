# TipTap IME Logger (#4108 Enter / #6825 list-item Safari)

## Goal

`apps/react-example`에 TipTap 최소 마운트 + `ImeCaptureShell` Logger를 추가해
[TipTap #4108](https://github.com/ueberdosis/tiptap/issues/4108) (조합 중 Enter → 음절 소실)과
[TipTap #6825](https://github.com/ueberdosis/tiptap/issues/6825) (Safari 리스트 첫 항목 IME)를
OS별로 재현·캡처하고, 트레이스로 `@siheom/ime` 프로필을 검증·확장한다.

## Behaviors

### Capture story (phase 1)

- [x] `TipTapLogger` + `IME/TipTap` Storybook: TipTap contenteditable에 타이핑하면 이벤트 로그가 쌓인다
      (accessible name · JSON 복사/다운로드 · 캡처 안내는 `ImeCaptureShell` / Storybook 기본 — 별도 `it` 없음)

### Debug + scenarios (phase 2)

- [x] 캡처 트레이스에 `tiptapDebug.final` 스냅샷이 붙는다 (editorText / composing / nodeType)
- [x] 시나리오 모드 `enter-newline` / `list-item-start` (scenarioId·listItem 시드)
- [x] `fixtures/` 빈 셸 + README (windows / macos chrome·safari / linux / android)

### OS goldens + emulator (phase 3)

- [x] Windows OS captures in `fixtures/windows-chrome-ms|ngs|firefox-ms` (enter; list where available)
- [x] `@siheom/ime` profiles: `windows-chrome-ms` (existing), `windows-chrome-ngs`, `windows-firefox-ms`
- [x] Emulator tests vs Windows goldens (`windowsProfiles.test.ts`)
- [ ] macOS / Linux / Android TipTap OS fills
- [ ] TipTap broken 게이트 (에디터 문서 상태) — after more goldens
- [ ] #4108/#6825 TipTap fixed workaround (later)

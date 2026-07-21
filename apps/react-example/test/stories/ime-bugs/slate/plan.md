# Slate IME Logger Story (placeholder + first Hangul syllable)

## Goal

`apps/react-example`에 Slate 최소 `Editable` + placeholder on/off + `ImeCaptureShell` Logger Story를 추가해 Android Chrome 등에서 [Slate #5989](https://github.com/ianstormtaylor/slate/issues/5989) 첫 음절 깨짐을 재현·캡처한다.

## Behaviors

### Capture story (phase 1)

- [x] `SlateLogger`가 렌더링되고 contenteditable 영역이 accessible name을 가진다
- [x] Storybook에 `IME/Slate` Capture story가 등록된다
- [x] placeholder on/off 토글 → **캡처 대상** 토글 (Slate+placeholder / plain control)
- [x] IME 이벤트가 로그에 기록된다
- [x] 트레이스 JSON을 복사/다운로드할 수 있다 (`ImeCaptureShell` 기본 동작)
- [x] Android Chrome 캡처용 안내 문구가 표시된다

### Fixtures + emulator (phase 2)

- [x] OS 캡처 JSON이 `fixtures/android-chrome/`에 정리된다
- [x] `@siheom/ime` `android-chrome-slate-placeholder-broken` / `-plain-control` profiles (golden replay)
- [x] `composeHangul.test`: broken → `ㄱㄱㅏㄱㅏ`, plain control → `가`
- [x] `SlateLogger.ime.test`: broken on Slate editor ≠ `가`; plain control textarea = `가`
- [x] Android Firefox captures + `android-firefox-slate-*` profiles (plain input `ㄱ`; Slate mount fidelity device-only)

### Linux desktop baseline (phase 3)

- [x] OS 캡처 JSON이 `fixtures/linux-chrome/` · `fixtures/linux-firefox/`에 정리된다
- [x] `@siheom/ime` `linux-*-slate-placeholder-fixed` / `-plain-control` profiles (golden replay)
- [x] `composeHangul.test`: placeholder + plain control → `가` (Android와 달리 깨지지 않음)
- [x] `SlateLogger.ime.test`: Linux Chrome/Firefox placeholder Slate editor = `가`

### Fix direction (phase 4) — mechanism, keep official placeholder

- [x] Reject post-hoc rewrite (flicker capture)
- [x] Reject decorative overlay (still explodes; not a real fix) — `decorative-still-explodes-가나다가나다.json`
- [x] Research notes: `docs/research/slate-placeholder-hangul-mechanism.md`
- [x] Device tri-mode experiment — broken best; app patch modes removed
- [x] Fix alternatives: `docs/research/slate-placeholder-fix-alternatives.md`
- [x] Alternative A/B/C Story modes (`alt-a`, `alt-b`, `alt-c`) + broken baseline
- [ ] Device: compare alt-a / alt-b / alt-c on AF → `가나다가나다` intact

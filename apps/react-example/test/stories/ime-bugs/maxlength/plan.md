# MaxLength during composition

## Goal

`maxLength`가 있는 입력란에서 **조합 중 preedit** 때문에 글자 수 제한을 넘어 입력되는 버그를 재현한다.
브라우저 기본(broken)과 입력마다 clamp(fixed)를 비교하고, OS IME 골든 트레이스를 캡처한다.

## Behaviors

- [x] `mode="broken"`: 조합 중 preedit가 `maxLength`를 넘고, IME가 확정 시 초과 음절을 거부해 최종값은 제한 이내
- [x] `mode="fixed"`: input마다 clamp — Chrome은 조용히 종료, Safari는 composition 재시작 + 빈 `insertText`
- [x] `linux-chrome-ibus-hangul` / `macos-chrome-apple` / `macos-safari-apple` 프로필 IME 테스트
- [x] Storybook `IME/MaxLength Field`로 OS 캡처 (`fixtures/<profileId>/`)
- [x] ime-logger 시나리오 `maxlength-overflow` 추가
- [x] OS golden fixtures 커밋 + critical events 매칭 (macos-chrome-apple, macos-safari-apple broken/fixed)

## Capture

1. Storybook → **IME/MaxLength Field**
2. maxLength 6, broken 모드
3. 한글로 「가나다라마바사」(7글자) 입력
4. JSON → `fixtures/<profileId>/broken-7of6.json`

# Hanja autocomplete vs IME candidate keys

## Goal

macOS에서 **한자 변환(Option+Enter)** 후보 탐색 키(방향키, 숫자, Enter)가
자동완성 combobox에 가로채이는 버그를 재현한다. focus-steal과 달리 blur가 아니라 **키 충돌**이다.

실제 시나리오: 「김태희」를 한 글자씩 「金泰熙」로 변환
(김→金, 태→泰, 희→熙).

## Behaviors

- [x] `mode="broken"`: Arrow/Enter/digit keys move or pick combobox without `isComposing` guard
- [x] `mode="fixed"`: defer combobox keyboard handling while composing / 229 / `altKey`
- [x] `mode="fixed"`: detect composing via InputEvent.isComposing (compositionstart alone is unreliable)
- [x] `mode="fixed"`: no React setState while composing; settle query after composition ends
- [x] Logger buffers events during composition (sync setState mid-IME caused 김金 append)
- [x] Storybook logger with callback-ref event capture (broken mode logging works)
- [x] `user-event/hanja-name.json` via `userEventTraces.test.tsx`
- [ ] OS `macos-chrome-apple/broken-hanja-name.json` — manual capture
- [ ] OS `macos-chrome-apple/fixed-hanja-name.json` — manual capture

## Storybook

`bun run storybook` → **IME / Hanja Autocomplete Conflict**

## Key conflicts

| Key | IME (Hanja conversion) | Broken combobox |
| --- | ---------------------- | --------------- |
| ArrowUp/Down | move Hanja candidate | move suggestion highlight |
| Enter | confirm Hanja candidate | pick highlighted suggestion |
| 1–9 | pick Hanja candidate by number | pick suggestion by index |

## Related bugs

- [Discourse Meta — Enter vs IME](https://meta.discourse.org/t/ime-composition-enter-key-triggers-message-send-instead-of-confirming-input/385840) (chat send; same Enter collision class)
- focus-steal combobox in this repo (blur/focus bounce — different mechanism)

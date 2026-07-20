# Enter-submit during composition (SearchField)

## Goal

검색창처럼 Enter로 submit하는 UI에서, **조합 확정 Enter**가 submit으로 오인되는 버그를 재현한다.
Safari뿐 아니라 **Linux Chrome + ibus-hangul**도 `compositionend` 뒤 `Enter(isComposing: false)`를 보낸다
(fixtures/linux-ibus-hangul-chrome). `!e.isComposing`만 보면 확정 키가 검색된다.

## Behaviors

- [x] `mode="broken"`: Enter when `!isComposing` submits
- [x] `mode="fixed"`: swallows the **next** Enter after `compositionend` (not just same-microtask)
- [x] `linux-chrome-ibus-hangul` / `macos-safari` profiles: `김{Enter}` → broken submits, fixed does not
- [x] `chromium-enter-229`: broken does not false-submit (229 confirm)
- [x] OS Linux captures committed under `fixtures/linux-ibus-hangul-chrome/`

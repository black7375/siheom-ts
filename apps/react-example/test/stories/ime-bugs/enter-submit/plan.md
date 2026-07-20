# Enter-submit during composition (SearchField)

## Goal

검색창처럼 Enter로 submit하는 UI에서, **조합 확정 Enter**가 submit으로 오인되는 버그를 재현한다.
Safari/WebKit은 `compositionend` 뒤 `keydown Enter` (`isComposing: false`)를 보내므로
`!e.isComposing`만 보면 확정 키가 전송/검색된다.
(참고: [Ariakit #6579](https://github.com/ariakit/ariakit/issues/6579), [React Aria #10249](https://github.com/adobe/react-spectrum/issues/10249), Square IME blog)

## Behaviors

- [x] `mode="broken"`: Enter when `!isComposing` submits (no 229 / post-compositionend guard)
- [x] `mode="fixed"`: ignores Enter while composing, keyCode 229, or immediately after `compositionend`
- [x] Under `macos-safari` profile, typing `김{Enter}` mid-composition: broken submits once, fixed does not
- [x] Under `linux-chrome-ibus-hangul` (chromium facet), broken does not false-submit on confirm (229 / isComposing)
- [x] Storybook logger story for optional OS capture + fixture folders
- [x] After confirm, a second `{Enter}` still submits under fixed + macos-safari

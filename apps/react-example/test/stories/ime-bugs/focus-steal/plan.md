# Focus-steal combobox (IME bug fixture)

## Goal

자동완성이 **매 input마다 option으로 focus를 보냈다가 다시 input으로 되돌리는** 깨진 UI를 재현한다.
영문에는 조합이 없어서 문제가 없고, Hangul 조합 중에는 잠깐의 blur가 `compositionend`를 강제해 자모가 풀어진다.
Storybook 키로거로 OS 트레이스를 캡처해 `@siheom/ime` 에뮬레이션과 대조한다.
(참고: [Ariakit #6663](https://github.com/ariakit/ariakit/issues/6663), [React Aria #10126](https://github.com/adobe/react-spectrum/issues/10126))

## Behaviors

- [x] `mode="broken"`: after each `input`, focus moves to the first option then back to the input
- [x] After Latin (non-composing) typing in broken mode, focus ends on the input (no lasting option focus)
- [x] Storybook logger story for OS capture of aborted Hangul composition
- [x] OS `broken-hangul.json`: 김태희 → `ㄱㅣㅁㅌㅐㅎㅡㅣ` (full 풀어쓰기)
- [x] `mode="fixed"` must not DOM-focus options (virtual highlight only) — bouncing on `compositionend` still breaks Hangul (음절 경계마다 end가 남)
- [x] `mode="fixed"` must not rewrite controlled `value` during composition (React writeback corrupts preedit; capture showed `김ㅐㅢ`)
- [x] OS `fixed-hangul.json` re-captured as real `김태희` after the above fix
- [x] `@siheom/ime` `composeHangul` aborts on blur and yields 풀어쓰기 under focus bounce
- [x] Integration: broken + createImeActions → OS broken final value; fixed → `김태희`

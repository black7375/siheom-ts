# Focus-steal combobox (IME bug fixture)

## Goal

자동완성이 **매 input마다 option으로 focus를 훔치는** 깨진 UI를 재현한다.
실기기에서 Hangul 조합 중 focus가 빠지면 `compositionend`가 강제되고 자모가 풀어진다.
Storybook 키로거로 OS 트레이스를 캡처해 `@siheom/ime` 에뮬레이션과 대조한다.
(참고: [Ariakit #6663](https://github.com/ariakit/ariakit/issues/6663), [React Aria #10126](https://github.com/adobe/react-spectrum/issues/10126))

## Behaviors

- [x] `FocusStealCombobox` (`mode="broken"`) moves focus to the first suggestion after each `input`
- [x] `FocusStealCombobox` (`mode="fixed"`) does not steal focus while `isComposing` is true
- [x] Storybook story exposes the combobox with IME event logging (copy/download JSON)
- [x] Capture scenario instructs typing 「김태희」 under broken mode to record aborted composition

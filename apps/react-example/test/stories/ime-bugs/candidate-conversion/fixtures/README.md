# Candidate conversion capture fixtures

후보-변환형 IME(Pinyin, 일본어, 한자)의 OS golden trace를 여기에 둡니다.
`@siheom/ime`는 아직 Hangul 조합만 에뮬레이트하므로, 변환형은 **OS 캡처 → 분석 → 에뮬레이터 v2** 순서입니다.

## Directory layout (planned)

| Directory | IME | Example scenario |
| --------- | --- | ---------------- |
| `macos-chrome-pinyin/` | macOS + Chrome + Pinyin | `pinyin-raw-enter` — hello + Enter (no candidate) |
| `macos-chrome-japanese/` | macOS + Chrome + Japanese | `japanese-romaji` — nihongo → 日本語 |
| `linux-ibus-pinyin-chrome/` | Linux + ibus + Pinyin | same as above |
| `macos-chrome-hanja/` | macOS + Korean Hanja | `korean-hanja` |

`profileId` = `{os}-{browser}-{ime}` (logger 메타데이터와 동일).

## File naming

`{mode}-{scenario}-{hint}.json` — e.g. `broken-pinyin-raw-enter.json`, `fixed-japanese-romaji.json`.

## What to capture

Storybook: **IME / Candidate Conversion Chat** → 시나리오 선택 → broken/fixed → 실제 키보드 입력 → JSON 다운로드.

각 trace에는 최소한 다음이 포함되어야 합니다:

- `compositionstart` / `compositionupdate` / `compositionend` (후보 창 동안 preedit)
- 후보 확정용 `keydown` Enter (`isComposing` true/false, `keyCode` 229 여부)
- 확정 후 `input` / `beforeinput` (`insertCompositionText` 또는 `insertText`)
- broken 시나리오에서는 send가 1이 되는 시점의 이벤트 순서

## Related bugs (research)

- [Discourse Meta — Enter sends instead of confirming IME input](https://meta.discourse.org/t/ime-composition-enter-key-triggers-message-send-instead-of-confirming-input/385840) (fixed in [discourse/discourse#35448](https://github.com/discourse/discourse/pull/35448))
- [Jupyter Chat #406](https://github.com/jupyterlab/jupyter-chat/issues/406)
- [Vercel agent-browser #1379](https://github.com/vercel-labs/agent-browser/issues/1379)
- [Paseo #312](https://github.com/getpaseo/paseo/issues/312)
- [Cursor forum — AskQuestion IME Enter](https://forum.cursor.com/t/critical-i18n-ime-enter-key-triggers-unintended-submission-in-chat-and-askquestion-completely-breaks-cjk-input-for-1-5-billion-users/154276)

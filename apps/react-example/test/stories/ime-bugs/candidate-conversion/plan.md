# Candidate conversion — Enter during chat send

## Goal

후보-변환형 IME(중국어 Pinyin, 일본어, 한글→한자)에서 **Enter로 후보/preedit를 확정**할 때,
채팅 UI가 같은 Enter를 **메시지 전송**으로 처리하는 버그를 재현·캡처한다.

Hangul **조합형**(enter-submit 시나리오)과 키 충돌 패턴은 같지만, 변환형은:

- preedit 단계가 더 길고(로마자/병음 입력 → 후보 창)
- Enter가 “첫 번째 후보 선택”이 아니라 **원문 preedit 확정**(후보 거부)에도 쓰임
- Space(후보 순환), Arrow(후보 이동) 충돌도 추가로 존재 (이 시나리오는 Enter부터)

## Input-method class

Issue #14 taxonomy **#2 Conversion (candidates)** — see `docs/research/ime-browser-event-emulation.md`.

`@siheom/ime` v1 = Hangul composition only. 이 폴더는 **OS 캡처 + Storybook 로거**가 선행.

## Behaviors

- [x] `ChatMessageField` `mode="broken"`: Enter when `!isComposing` sends
- [x] `mode="fixed"`: swallows next Enter after `compositionend` (+ `keyCode === 229` guard)
- [x] `ChatMessageFieldLogger` — 4 capture scenarios (Pinyin raw/candidate, Japanese, Hanja)
- [x] Unit tests for broken/fixed with synthetic compositionend + delayed Enter
- [x] `user-event/` fixtures via `userEventTraces.test.tsx` (Vitest snapshot — not hand-written)
- [ ] OS golden fixtures under `fixtures/<profile>/` (empty shells — paste Storybook captures)
- [ ] `@siheom/ime` conversion emulator (future)
- [ ] Space / Arrow shortcut collision scenarios (future)

## Storybook

`bun run storybook` → **IME / Candidate Conversion Chat**

## Real-world bug survey

### Enter = send during IME composition / candidate confirm

| Product | Report | Symptom | Fix pattern |
| ------- | ------ | ------- | ----------- |
| Discourse Chat | [Meta #385840](https://meta.discourse.org/t/ime-composition-enter-key-triggers-message-send-instead-of-confirming-input/385840) | Chinese IME: type English `hello`, Enter to commit raw buffer → message sent | [PR #35448](https://github.com/discourse/discourse/pull/35448); workaround: Ctrl+Enter to send |
| Jupyter Chat | [#406](https://github.com/jupyterlab/jupyter-chat/issues/406) | Pinyin `jupyter` + Enter to confirm candidate → chat submitted | `!e.nativeEvent.isComposing && e.keyCode !== 229` |
| Vercel agent-browser | [#1379](https://github.com/vercel-labs/agent-browser/issues/1379) | Dashboard chat: Enter commit tears down composition, submits raw keystrokes | same guard |
| Paseo | [#312](https://github.com/getpaseo/paseo/issues/312) | macOS CJK: Enter confirm → send; terminal emulator in same app already checks `isComposing` | `if (event.isComposing) return` |
| Cursor | [Forum #154276](https://forum.cursor.com/t/critical-i18n-ime-enter-key-triggers-unintended-submission-in-chat-and-askquestion-completely-breaks-cjk-input-for-1-5-billion-users/154276) | AskQuestion free-text: Enter confirms kanji → entire form submitted | `!event.isComposing` on submit handler |

### Root cause (common)

```text
IME level:     Enter = confirm candidate / commit preedit
App level:     Enter = send message / submit form
```

Handler checks only `event.key === "Enter"` without `isComposing` or legacy `keyCode === 229`.

### Browser quirks

- **Safari / Linux ibus**: `compositionend` may fire **before** the confirm Enter `keydown` with `isComposing: false` — same class as `enter-submit` Hangul scenario.
- **Chromium**: confirm Enter often has `keyCode: 229` while composing; `!isComposing` alone is insufficient on some paths.
- **Recommended guard**: `!e.isComposing && e.keyCode !== 229` plus swallow first Enter after `compositionend` when needed.

### Discourse-specific nuance

Reporter notes: on google.com search, first candidate may need number key `1` instead of Enter — IME behavior varies by engine. Our captures should record **which confirm path** was used (Enter vs Space vs digit).

### Future collision keys (not in this scenario yet)

| Key | IME role | App conflict |
| --- | -------- | ------------ |
| Space | next candidate / page | scroll, play/pause, button activate |
| ArrowUp/Down | candidate navigation | message history, list focus |
| ArrowLeft/Right | candidate page / cursor in preedit | editor navigation |

## Capture scenarios (logger)

1. **pinyin-raw-enter** — Chinese IME + Latin `hello` + Enter (no candidate pick) — Discourse repro
2. **pinyin-candidate-enter** — `nihao` → 你好 + Enter
3. **japanese-romaji** — `nihongo` → 日本語 + Enter
4. **korean-hanja** — Hangul → Hanja conversion + Enter

Save JSON to `fixtures/<profile-dir>/` per `fixtures/README.md` (replace empty `events: []` shells).

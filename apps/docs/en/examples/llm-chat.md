# LLM Chat — Streaming Chat + Fake LLM API

A chat UI where sending a message streams the assistant's reply in chunks. Instead of a real API, the test injects a fake API it can drive directly, checking three distinct states: waiting, streaming, and complete.

Source: [`apps/react-example/test/stories/shadcn/llm-chat/StreamingChat.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/llm-chat/StreamingChat.tsx), [`StreamingChat.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/llm-chat/StreamingChat.test.tsx), [`fake-llm-api.ts`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/llm-chat/fake-llm-api.ts).

## UI

- Message input: role `textbox`, name `"메시지"`
- Send: role `button`, name `"전송"`
- User message: role `listitem`, name is the sent text
- Assistant reply: role `status`; its name moves through `"어시스턴트 응답 대기 중"` (waiting) → `"어시스턴트 응답 스트리밍"` (streaming) → `"어시스턴트 응답"` (done).

## Fake LLM API: the test drives the stream directly

`StreamingChat` receives an `LlmApi` implementation through the `api` prop. The real screen uses `fakeLlmApi` (a fixed reply) or a real backend, but the test passes the same `fakeLlmApi`, pre-configures chunks with `setStreamChunks`, and "delivers" one chunk at a time with `releaseNextStreamChunkInAct`.

```ts
// chat.fixture.ts
export const STREAM_CHUNKS = ["안", "녕하세요!"] as const;
export const SAMPLE_USER_MESSAGE = "hello";
```

This pattern differs from `withFakeTimers`/`effect.elapsed`. Instead of controlling time, the test code directly opens an **async gate** — a `Promise` each chunk waits on before arriving. For emulating a real streaming API, this pins down exactly how the UI reacts as each chunk lands, one step at a time, more precisely than a time-based fake timer would.

## Test: from partial text to the finished reply

```tsx
function setup(options?: { streamChunks?: readonly string[] }) {
  fakeLlmApi.reset();
  if (options?.streamChunks) {
    fakeLlmApi.setStreamChunks(options.streamChunks);
  }
  return given.render(<StreamingChat api={fakeLlmApi} />);
}

await runSiheom(
  setup({ streamChunks: STREAM_CHUNKS }),
  actions.fill(query.textbox("메시지"), "hello"),
  actions.click(query.button("전송")),
  assertions.visible(query.listitem("hello")),
  assertions.visible(query.status("어시스턴트 응답 대기 중")),
);

await fakeLlmApi.waitForStreamWaiting();
await fakeLlmApi.releaseNextStreamChunkInAct();
await runSiheom(
  assertions.visible(query.status("어시스턴트 응답 스트리밍")),
  assertions.textContent(query.status("어시스턴트 응답 스트리밍"), "안"),
);

await fakeLlmApi.waitForStreamWaiting();
await fakeLlmApi.releaseNextStreamChunkInAct();
await runSiheom(
  assertions.not.visible(query.status("어시스턴트 응답 스트리밍")),
  assertions.textContent(query.status("어시스턴트 응답"), "안녕하세요!"),
);
```

`runSiheom` is called three separate times. Between calls, `fakeLlmApi.waitForStreamWaiting()` confirms execution has reached the point of waiting for the next chunk, and `releaseNextStreamChunkInAct()` lets that chunk through. The key idea: each `runSiheom` call is a bundle of "actions and assertions possible at the current screen state," and the async waiting in between is handled outside of `runSiheom`.

## Accessibility notes

- The streaming reply and the finished reply are distinguished by different `aria-label`s (`"어시스턴트 응답 스트리밍"` vs. `"어시스턴트 응답"`). Visually the same text appears in the same spot, but a screen reader user needs to know "this isn't finished yet," so each state gets its own landmark.
- The very first moment the reply is empty shows separate text, `"응답 생성 중…"` (generating a response), instead of nothing (guarded by `content === ""`). Rendering an empty string would leave a screen reader with nothing to announce, so filling in a minimal status message matters.

## Next steps

- [effect · withFakeTimers](/en/concepts/effects) — Time-based async UI
- [given](/en/concepts/given) — Injecting props (`api`) through `given.render`
- [profile-avatar](/en/examples/profile-avatar) — Another async (upload) test pattern

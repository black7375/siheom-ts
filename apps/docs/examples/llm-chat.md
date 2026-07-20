# LLM Chat — Streaming Chat + Fake LLM API

메시지를 보내면 어시스턴트 응답이 청크 단위로 스트리밍되는 채팅 UI입니다. 실제 API 대신 테스트가 직접 스트림 진행을 통제할 수 있는 fake API를 주입해서, "응답 대기 중 → 스트리밍 중 → 완성" 세 상태를 각각 확인합니다.

소스: `apps/react-example/test/stories/shadcn/llm-chat/StreamingChat.tsx`, `StreamingChat.test.tsx`, `fake-llm-api.ts`.

## UI

- 메시지 입력: role `textbox`, name `"메시지"`
- 전송: role `button`, name `"전송"`
- 사용자 메시지: role `listitem`, name은 보낸 텍스트
- 어시스턴트 응답: role `status`; 상태에 따라 name이 `"어시스턴트 응답 대기 중"` → `"어시스턴트 응답 스트리밍"` → `"어시스턴트 응답"`으로 바뀝니다.

## Fake LLM API: 테스트가 스트림을 직접 통제

`StreamingChat`은 `api` prop으로 `LlmApi` 구현을 주입받습니다. 실제 화면에서는 `fakeLlmApi`(고정 응답)나 진짜 백엔드가 쓰이지만, 시험에서는 같은 `fakeLlmApi`를 넘기면서 `setStreamChunks`로 청크를 미리 정하고, `releaseNextStreamChunkInAct`로 청크 하나씩 "도착"시킵니다.

```ts
// chat.fixture.ts
export const STREAM_CHUNKS = ["안", "녕하세요!"] as const;
export const SAMPLE_USER_MESSAGE = "hello";
```

이 패턴은 `withFakeTimers`/`effect.elapsed`와는 다릅니다. 시간이 아니라 **비동기 게이트**(각 청크가 올 때까지 대기하는 `Promise`)를 테스트 코드가 직접 열어 주는 방식입니다. 실제 스트리밍 API를 흉내 낼 때, 시간 기반 fake timer보다 이 편이 "다음 청크가 왔을 때 UI가 어떻게 되는지"를 한 단계씩 정확히 짚어낼 수 있습니다.

## 시험: partial 텍스트부터 완성문까지

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

`runSiheom`을 세 번에 나눠 호출합니다. 각 구간 사이에서 `fakeLlmApi.waitForStreamWaiting()`으로 다음 청크를 기다리는 지점까지 실행이 도달했는지 확인하고, `releaseNextStreamChunkInAct()`로 그 청크를 흘려보냅니다. `runSiheom` 호출 하나는 "지금 화면 상태에서 할 수 있는 액션과 확인"의 묶음이고, 그 사이의 비동기 대기는 `runSiheom` 바깥에서 처리한다는 것이 이 예제의 핵심 아이디어입니다.

## 접근성 포인트

- 스트리밍 중인 응답과 완성된 응답을 서로 다른 `aria-label`(`"어시스턴트 응답 스트리밍"` vs `"어시스턴트 응답"`)로 구분합니다. 시각적으로는 같은 자리에 같은 텍스트가 나타나지만, 스크린 리더 사용자에게는 "아직 끝나지 않았다"는 정보가 중요하므로 상태별로 다른 landmark를 부여했습니다.
- 응답이 비어 있는 첫 순간에는 `"응답 생성 중…"`이라는 별도 텍스트를 보여줍니다(`content === ""`). 빈 문자열을 그대로 렌더링하면 스크린 리더가 아무것도 읽지 않으므로, 최소한의 안내 텍스트를 채워 넣는 것이 중요합니다.

## 다음 단계

- [effect · withFakeTimers](/concepts/effects) — 시간 기반 비동기 UI
- [given](/concepts/given) — `given.render`로 props(`api`) 주입하기
- [profile-avatar](/examples/profile-avatar) — 또 다른 비동기(업로드) 시험 패턴

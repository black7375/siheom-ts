import "../../../index.css";
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { SAMPLE_USER_MESSAGE, STREAM_CHUNKS } from "./chat.fixture";
import { fakeLlmApi } from "./fake-llm-api";
import { StreamingChat } from "./StreamingChat.tsx";

function setup(options?: { streamChunks?: readonly string[] }) {
  fakeLlmApi.reset();
  if (options?.streamChunks) {
    fakeLlmApi.setStreamChunks(options.streamChunks);
  }
  return given.render(<StreamingChat api={fakeLlmApi} />);
}

describe("StreamingChat", () => {
  it("스트리밍 응답이 partial 텍스트부터 완성문까지 쌓인다", async () => {
    await runSiheom(
      setup({ streamChunks: STREAM_CHUNKS }),
      actions.fill(query.textbox("메시지"), SAMPLE_USER_MESSAGE),
      actions.click(query.button("전송")),
      assertions.visible(query.listitem(SAMPLE_USER_MESSAGE)),
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
  });
});

import { describe, expect, it } from "vitest";

import { actions, assertions, given, query, runSiheom } from "@siheom/react";

import { TipTapLogger } from "./TipTapLogger";

describe("TipTapLogger", () => {
  it("renders an accessible contenteditable editor", async () => {
    await runSiheom(
      given.render(<TipTapLogger />),
      assertions.visible(query.textbox("TipTap editor")),
    );
  });

  it('registers Storybook title "IME/TipTap"', async () => {
    const stories = await import("./TipTapLogger.stories");
    expect(stories.default.title).toBe("IME/TipTap");
  });

  it("records input events on the TipTap editor", async () => {
    await runSiheom(
      given.render(<TipTapLogger />),
      actions.type(query.textbox("TipTap editor"), "a"),
      assertions.not.textContent(query.region("이벤트 로그"), "아직 이벤트가 없습니다."),
    );
  });

  it("copies the IME trace JSON after events are recorded", async () => {
    await runSiheom(
      given.render(<TipTapLogger />),
      actions.type(query.textbox("TipTap editor"), "a"),
      actions.click(query.button("JSON 복사")),
      assertions.textContent(query.status("캡처 상태"), "클립보드에 복사했습니다."),
    );
  });

  it("shows capture instructions for TipTap IME scenarios", async () => {
    await runSiheom(given.render(<TipTapLogger />), assertions.visible(query.region("캡처 지시")));
  });
});

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
});

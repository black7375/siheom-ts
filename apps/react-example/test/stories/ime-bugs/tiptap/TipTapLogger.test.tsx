import { describe, it } from "vitest";

import { actions, assertions, given, query, runSiheom } from "@siheom/react";

import { TipTapLogger } from "./TipTapLogger";

describe("TipTapLogger", () => {
  it("records input events on the TipTap editor", async () => {
    await runSiheom(
      given.render(<TipTapLogger />),
      actions.type(query.textbox("TipTap editor"), "a"),
      assertions.not.textContent(query.region("이벤트 로그"), "아직 이벤트가 없습니다."),
    );
  });
});

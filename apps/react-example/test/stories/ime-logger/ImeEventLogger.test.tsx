import { describe, it } from "vitest";
import { actions, assertions, given, query } from "@siheom/react";

import { ImeEventLogger } from "./ImeEventLogger";
import { runSiheom } from "../runSiheom";

describe("ImeEventLogger", () => {
  it("입력이 있으면 로그가 쌓이고 지우면 비운다", () => {
    return runSiheom(
      given.render(<ImeEventLogger />),
      assertions.visible(query.heading("Events (0)")),
      actions.fill(query.textbox("IME 입력"), "a"),
      assertions.value(query.textbox("IME 입력"), "a"),
      assertions.visible(query.heading(/Events \([1-9]\d*\)/)),
      actions.click(query.button("지우기")),
      assertions.value(query.textbox("IME 입력"), ""),
      assertions.visible(query.heading("Events (0)")),
    );
  });
});

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

  it("시나리오를 고르면 지시와 기대값이 보인다", () => {
    return runSiheom(
      given.render(<ImeEventLogger />),
      assertions.textContent(query.status("시나리오 기대값"), "김태희"),
      actions.click(query.button("영어가 섞인 입력")),
      assertions.textContent(query.status("시나리오 기대값"), "hello 안녕"),
    );
  });
});

import { describe, it } from "vitest";

import { actions, assertions, given, query, runSiheom } from "@siheom/react";

import { LexicalLogger } from "./LexicalLogger";

describe("LexicalLogger", () => {
  it("renders an accessible contenteditable editor", async () => {
    await runSiheom(
      given.render(<LexicalLogger />),
      assertions.visible(query.textbox("Lexical editor")),
    );
  });

  it("records input events on the Lexical editor", async () => {
    await runSiheom(
      given.render(<LexicalLogger />),
      actions.type(query.textbox("Lexical editor"), "a"),
      assertions.not.textContent(query.region("이벤트 로그"), "아직 이벤트가 없습니다."),
    );
  });

  it("shows capture instructions for Android Firefox", async () => {
    await runSiheom(
      given.render(<LexicalLogger />),
      assertions.visible(query.region("캡처 지시")),
    );
  });
});

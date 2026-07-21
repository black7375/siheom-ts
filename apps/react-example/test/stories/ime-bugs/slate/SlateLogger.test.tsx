import { describe, it } from "vitest";

import { actions, assertions, given, query, runSiheom } from "@siheom/react";

import { SlateLogger } from "./SlateLogger";

describe("SlateLogger", () => {
  it("renders an accessible contenteditable editor", async () => {
    await runSiheom(
      given.render(<SlateLogger />),
      assertions.visible(query.textbox("Slate editor")),
    );
  });

  it("records input events on the Slate editor", async () => {
    await runSiheom(
      given.render(<SlateLogger />),
      actions.type(query.textbox("Slate editor"), "a"),
      assertions.not.textContent(query.region("이벤트 로그"), "아직 이벤트가 없습니다."),
    );
  });

  it("shows capture instructions for Android Chrome", async () => {
    await runSiheom(given.render(<SlateLogger />), assertions.visible(query.region("캡처 지시")));
  });

  it("shows placeholder on/off toggle", async () => {
    await runSiheom(
      given.render(<SlateLogger />),
      assertions.visible(query.group("placeholder")),
    );
  });
});

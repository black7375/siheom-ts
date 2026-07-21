import { describe, it } from "vitest";

import { actions, assertions, given, query, runSiheom } from "@siheom/react";

import { SlateLogger } from "./SlateLogger";

describe("SlateLogger", () => {
  it("renders an accessible Slate contenteditable editor by default", async () => {
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

  it("shows capture target toggle (Slate vs plain control)", async () => {
    await runSiheom(
      given.render(<SlateLogger />),
      assertions.visible(query.group("캡처 대상")),
    );
  });

  it("shows Slate fix mode toggle (broken / minimal / fixed)", async () => {
    await runSiheom(
      given.render(<SlateLogger />),
      assertions.visible(query.group("Slate fix 모드")),
    );
  });

  it("renders plain control textarea when captureTarget is plain-control", async () => {
    await runSiheom(
      given.render(<SlateLogger captureTarget="plain-control" />),
      assertions.visible(query.textbox("Plain control input")),
    );
  });
});

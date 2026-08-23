import { describe, expect, it } from "vitest";
import { query } from "@siheom/core";
import {
  button,
  buttonWithHandler,
  errorField,
  labelInput,
  liveStatus,
  setupSiheom,
} from "./testHelpers.ts";

describe("virtual screen reader registries", () => {
  it("starts over document.body and announces nodes as the cursor moves", async () => {
    const { runSiheom, given, effect, assertions } = setupSiheom();

    await runSiheom(
      given.render(button("저장")),
      given.startScreenReader(),
      effect.screenReaderNext(),
      assertions.screenReaderContainsSpokenPhrase(query.button("저장"), "button, 저장"),
      given.stopScreenReader(),
    );
  });

  it("stopScreenReader clears the log and is idempotent before start", async () => {
    const { runSiheom, given, effect, assertions } = setupSiheom();

    await runSiheom(
      given.render(button("저장")),
      given.startScreenReader(),
      effect.screenReaderNext(),
      given.stopScreenReader(),
      given.stopScreenReader(),
      given.startScreenReader(),
      assertions.screenReaderSpokenPhraseLog(query.button("저장"), ["document"]),
      given.stopScreenReader(),
    );
  });

  it("next and previous move the cursor and update the active node", async () => {
    const { runSiheom, given, effect, assertions } = setupSiheom();
    const { el } = labelInput();

    await runSiheom(
      given.render(el),
      given.startScreenReader(),
      effect.screenReaderNext(),
      effect.screenReaderNext(),
      assertions.screenReaderCursorOn(query.textbox("이름")),
      effect.screenReaderPrevious(),
      assertions.screenReaderCursorOn(query.textbox("이름"), false),
      given.stopScreenReader(),
    );
  });

  it("press Enter on the active button runs its default action", async () => {
    let clicks = 0;
    const { runSiheom, given, effect, assertions } = setupSiheom();

    await runSiheom(
      given.render(buttonWithHandler("저장", () => clicks++)),
      given.startScreenReader(),
      effect.screenReaderNext(),
      effect.screenReaderPress("Enter"),
      assertions.screenReaderCursorOn(query.button("저장")),
      given.stopScreenReader(),
    );

    expect(clicks).toBe(1);
  });

  it("act clicks the active node", async () => {
    let clicks = 0;
    const { runSiheom, given, effect } = setupSiheom();

    await runSiheom(
      given.render(buttonWithHandler("저장", () => clicks++)),
      given.startScreenReader(),
      effect.screenReaderNext(),
      effect.screenReaderAct(),
      given.stopScreenReader(),
    );

    expect(clicks).toBe(1);
  });

  it("types text into the active textbox", async () => {
    const { runSiheom, given, effect, assertions } = setupSiheom();
    const { el, input } = labelInput();

    await runSiheom(
      given.render(el),
      given.startScreenReader(),
      effect.screenReaderNext(),
      effect.screenReaderNext(),
      assertions.screenReaderCursorOn(query.textbox("이름")),
      effect.screenReaderType("김태희"),
      given.stopScreenReader(),
    );

    expect(input.value).toBe("김태희");
  });

  it("performs jumpToErrorMessageElement to an aria-errormessage target", async () => {
    const { runSiheom, given, effect, assertions } = setupSiheom();

    await runSiheom(
      given.render(errorField()),
      given.startScreenReader(),
      effect.screenReaderNext(),
      effect.screenReaderNext(),
      assertions.screenReaderCursorOn(query.textbox("이메일")),
      assertions.screenReaderContainsSpokenPhrase(query.textbox("이메일"), "1 error message"),
      effect.screenReaderPerform("jumpToErrorMessageElement"),
      effect.screenReaderNext(),
      assertions.screenReaderItemText(query.alert(/.*/), "올바른 이메일 형식이 아닙니다"),
      given.stopScreenReader(),
    );
  });

  it("clearLog clears the spoken phrase log", async () => {
    const { runSiheom, given, effect, assertions } = setupSiheom();

    await runSiheom(
      given.render(button("저장")),
      given.startScreenReader(),
      effect.screenReaderNext(),
      effect.screenReaderClearLog(),
      assertions.screenReaderSpokenPhraseLog(query.button("저장"), []),
      given.stopScreenReader(),
    );
  });

  it("announces role=status live region content changes in the spoken phrase log", async () => {
    const { runSiheom, given, actions, assertions } = setupSiheom();

    await runSiheom(
      given.render(liveStatus()),
      given.startScreenReader(),
      actions.click(query.button("알림 표시")),
      assertions.screenReaderContainsSpokenPhrase(query.status("알림"), "저장됨"),
      given.stopScreenReader(),
    );
  });

  it("asserts the full spoken phrase log matches expected phrases", async () => {
    const { runSiheom, given, effect, assertions } = setupSiheom();

    await runSiheom(
      given.render(button("저장")),
      given.startScreenReader(),
      effect.screenReaderNext(),
      assertions.screenReaderSpokenPhraseLog(query.button("저장"), ["document", "button, 저장"]),
      given.stopScreenReader(),
    );
  });

  it("createVirtualScreenReaderExtension registers new keys without colliding", () => {
    const { given, effect, assertions, actions } = setupSiheom();

    expect(given.startScreenReader).toBeDefined();
    expect(given.stopScreenReader).toBeDefined();
    expect(effect.screenReaderNext).toBeDefined();
    expect(effect.screenReaderPrevious).toBeDefined();
    expect(effect.screenReaderPress).toBeDefined();
    expect(effect.screenReaderType).toBeDefined();
    expect(effect.screenReaderAct).toBeDefined();
    expect(effect.screenReaderPerform).toBeDefined();
    expect(assertions.screenReaderItemText).toBeDefined();
    expect(assertions.screenReaderLastSpokenPhrase).toBeDefined();
    expect(assertions.screenReaderSpokenPhraseLog).toBeDefined();
    expect(assertions.screenReaderContainsSpokenPhrase).toBeDefined();
    expect(assertions.screenReaderCursorOn).toBeDefined();

    expect(actions.click).toBeDefined();
    expect(assertions.visible).toBeDefined();
  });
});

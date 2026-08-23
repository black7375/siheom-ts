import "../../index.css";
import { describe, it } from "vitest";
import { query } from "@siheom/core";
import { SignUpForm } from "../SignUpForm";
import { createVirtualScreenReaderSiheom } from "./createVirtualScreenReaderSiheom";

const noop = async () => {};

describe("SignUpForm + virtual screen reader", () => {
  it("빈 값으로 제출하면 스크린 리더가 각 에러 메시지를 말한다", async () => {
    const { runSiheom, actions, assertions, given, effect } = createVirtualScreenReaderSiheom();

    await runSiheom(
      given.render(<SignUpForm signUpMember={noop} />),
      given.startScreenReader(),
      actions.click(query.button("가입하기")),
      effect.screenReaderPress("Shift+Tab"),
      effect.screenReaderPress("Shift+Tab"),
      effect.screenReaderPress("Shift+Tab"),
      effect.screenReaderPress("Shift+Tab"),
      assertions.screenReaderContainsSpokenPhrase(query.form("회원가입"), "1 error message"),
      effect.screenReaderPerform("jumpToErrorMessageElement"),
      effect.screenReaderNext(),
      assertions.screenReaderContainsSpokenPhrase(
        query.form("회원가입"),
        "올바른 이메일 형식이 아닙니다",
      ),
      given.stopScreenReader(),
    );
  });
});

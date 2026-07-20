import "../../../index.css";
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { VERIFICATION_CODE } from "./verification.fixture";
import { TwoFactorForm } from "./TwoFactorForm.tsx";

describe("TwoFactorForm", () => {
  it("인증 코드를 입력하고 확인할 수 있다", async () => {
    await runSiheom(
      given.render(<TwoFactorForm />),
      actions.fill(query.textbox("인증 코드"), VERIFICATION_CODE),
      actions.click(query.button("확인")),
      assertions.textContent(query.status("인증 결과"), "인증되었습니다"),
    );
  });
});

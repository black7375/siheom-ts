import "../../../index.css";
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { BillingAlert } from "./BillingAlert.tsx";

describe("BillingAlert", () => {
  it("결제 실패 알림을 확인하고 닫을 수 있다", async () => {
    await runSiheom(
      given.render(<BillingAlert />),
      assertions.visible(query.alert("결제 실패")),
      actions.click(query.button("확인")),
      assertions.not.visible(query.alert("결제 실패")),
    );
  });
});

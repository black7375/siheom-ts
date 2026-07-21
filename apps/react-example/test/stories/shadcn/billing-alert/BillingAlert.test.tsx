import "../../../index.css";
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { BillingAlert } from "./BillingAlert.tsx";

describe("BillingAlert", () => {
  it("초기 접근성 스냅샷", async () => {
    await runSiheom(
      given.render(<BillingAlert />),
      assertions.a11ySnapshot(query.region("청구 알림"), "billing-alert-initial.snap"),
    );
  });

  it("결제 실패 알림을 확인하고 닫을 수 있다", async () => {
    await runSiheom(
      given.render(<BillingAlert />),
      assertions.visible(query.alert("결제 실패")),
      actions.click(query.button("확인")),
      assertions.not.visible(query.alert("결제 실패")),
    );
  });
});

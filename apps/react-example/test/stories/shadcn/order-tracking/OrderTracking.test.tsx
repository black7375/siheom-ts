import "../../../index.css";
import { describe, it } from "vitest";
import { assertions, given, query, runSiheom } from "@siheom/react";
import { OrderTracking } from "./OrderTracking.tsx";

describe("OrderTracking", () => {
  it("주문 추적 화면을 볼 수 있다", async () => {
    await runSiheom(
      given.render(<OrderTracking />),
      assertions.visible(query.region("주문 배송")),
      assertions.visible(query.listitem("주문 접수")),
      assertions.visible(query.listitem("배송 중")),
      assertions.current(query.listitem("배송 중"), "step"),
      assertions.not.current(query.listitem("주문 접수"), "step"),
      assertions.not.current(query.listitem("배달 완료"), "step"),
      assertions.textContent(query.region("주문 정보"), "ORD-2024-001"),
      assertions.textContent(query.region("주문 정보"), "무선 이어폰"),
    );
  });
});

import "../../../index.css";
import { describe, it } from "vitest";
import { assertions, given, query, runSiheom } from "@siheom/react";
import { OrderTracking } from "./OrderTracking.tsx";

describe("OrderTracking", () => {
  it("주문 배송 타임라인을 볼 수 있다", async () => {
    await runSiheom(
      given.render(<OrderTracking />),
      assertions.visible(query.region("주문 배송")),
      assertions.visible(query.listitem("주문 접수")),
      assertions.visible(query.listitem("배송 중")),
    );
  });

  it("현재 배송 단계가 표시된다", async () => {
    await runSiheom(
      given.render(<OrderTracking />),
      assertions.current(query.listitem("배송 중"), "step"),
      assertions.not.current(query.listitem("주문 접수"), "step"),
      assertions.not.current(query.listitem("배달 완료"), "step"),
    );
  });

  it("주문 정보를 확인할 수 있다", async () => {
    await runSiheom(
      given.render(<OrderTracking />),
      assertions.textContent(query.region("주문 정보"), "ORD-2024-001"),
      assertions.textContent(query.region("주문 정보"), "무선 이어폰"),
    );
  });
});

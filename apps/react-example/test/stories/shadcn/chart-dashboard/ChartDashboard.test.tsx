import "../../../index.css";
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { ChartDashboard } from "./ChartDashboard.tsx";

describe("ChartDashboard", () => {
  it("매출 탭에서 방문자 탭으로 전환하면 해당 차트와 요약이 보인다", async () => {
    await runSiheom(
      given.render(<ChartDashboard />),
      assertions.selected(query.tab("매출")),
      assertions.visible(query.region("매출 차트")),
      assertions.textContent(query.status("총 매출"), "₩1,200,000"),
      actions.click(query.tab("방문자")),
      assertions.selected(query.tab("방문자")),
      assertions.visible(query.region("방문자 차트")),
      assertions.not.visible(query.region("매출 차트")),
      assertions.textContent(query.status("총 방문자"), "48,200"),
    );
  });
});

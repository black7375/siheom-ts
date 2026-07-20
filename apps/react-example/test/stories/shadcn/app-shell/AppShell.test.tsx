import "../../../index.css";
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { AppShell } from "./AppShell.tsx";

describe("AppShell", () => {
  it("사이드바에서 설정으로 이동하면 breadcrumb과 화면이 갱신된다", async () => {
    await runSiheom(
      given.render(<AppShell />),
      assertions.visible(query.region("대시보드")),
      assertions.current(
        query.within(query.navigation("breadcrumb"), query.link("대시보드")),
        "page",
      ),
      actions.click(query.within(query.navigation("앱 메뉴"), query.link("설정"))),
      assertions.visible(query.region("설정")),
      assertions.current(
        query.within(query.navigation("breadcrumb"), query.link("설정")),
        "page",
      ),
      assertions.not.visible(query.region("대시보드")),
    );
  });
});

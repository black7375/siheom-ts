import "../../../index.css";
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { NextRouterApp } from "./NextRouterApp";
import { NOTICES } from "../shared/notices";

describe("NextRouterApp", () => {
  it("외부 링크로 /notice?id=123 에 진입하면 해당 Accordion이 열려 있다", async () => {
    await runSiheom(
      given.render(<NextRouterApp initialPath="/notice?id=123" />),
      assertions.visible(query.region("공지사항")),
      assertions.visible(query.region(NOTICES[0]!.title)),
    );
  });

  it("공지 링크를 클릭하면 query string과 함께 이동하고 Accordion이 열린다", async () => {
    const target = NOTICES[1]!;

    await runSiheom(
      given.render(<NextRouterApp initialPath="/" />),
      actions.click(query.link(target.title)),
      assertions.visible(query.region("공지사항")),
      assertions.visible(query.region(target.title)),
      assertions.not.visible(query.region(NOTICES[0]!.title)),
    );
  });
});

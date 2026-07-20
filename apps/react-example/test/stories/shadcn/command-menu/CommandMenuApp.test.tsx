import "../../../index.css";
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "../runSiheom.tsx";
import { CommandMenuApp } from "./CommandMenuApp.tsx";

describe("CommandMenuApp", () => {
  it("빠른 실행에서 명령을 선택할 수 있다", async () => {
    await runSiheom(
      given.render(<CommandMenuApp />),
      actions.click(query.button("빠른 실행")),
      assertions.visible(query.dialog("빠른 실행")),
      actions.click(query.within(query.dialog("빠른 실행"), query.option("새 문서"))),
      assertions.not.visible(query.dialog("빠른 실행")),
      assertions.textContent(query.status("실행 결과"), "새 문서 실행됨"),
    );
  });
});

import "../../../index.css";
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { TaskTable } from "./TaskTable";

describe("TaskTable", () => {
  it("첫 페이지에 할 일 목록이 보인다", async () => {
    await runSiheom(
      given.render(<TaskTable />),
      assertions.visible(query.table("할 일")),
      assertions.visible(query.row("API 문서 작성")),
      assertions.visible(query.row("디자인 리뷰")),
      assertions.not.visible(query.row("배포 자동화")),
    );
  });

  it("다음 페이지로 이동할 수 있다", async () => {
    await runSiheom(
      given.render(<TaskTable />),
      assertions.not.visible(query.row("배포 자동화")),
      actions.click(query.button("다음 페이지")),
      assertions.visible(query.row("배포 자동화")),
      assertions.not.visible(query.row("API 문서 작성")),
    );
  });

  it("할 일 상태 배지가 보인다", async () => {
    await runSiheom(
      given.render(<TaskTable />),
      assertions.textContent(query.status("API 문서 작성 상태"), "진행 중"),
      assertions.textContent(query.status("디자인 리뷰 상태"), "완료"),
    );
  });
});

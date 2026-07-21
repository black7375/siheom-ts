import "../../../index.css";
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { TaskTable } from "./TaskTable.tsx";

describe("TaskTable", () => {
  it("초기 접근성 스냅샷", async () => {
    await runSiheom(
      given.render(<TaskTable />),
      assertions.a11ySnapshot(query.region("할 일 관리"), "task-table-initial.snap"),
    );
  });

  it("첫 페이지에 할 일 목록과 상태 배지가 보인다", async () => {
    await runSiheom(
      given.render(<TaskTable />),
      assertions.visible(query.table("할 일")),
      assertions.visible(query.row("API 문서 작성")),
      assertions.visible(query.row("디자인 리뷰")),
      assertions.not.visible(query.row("배포 자동화")),
      assertions.textContent(query.status("API 문서 작성 상태"), "진행 중"),
      assertions.textContent(query.status("디자인 리뷰 상태"), "완료"),
    );
  });

  it("페이지를 이동할 수 있다", async () => {
    await runSiheom(
      given.render(<TaskTable />),
      assertions.visible(query.button("1")),
      assertions.visible(query.button("2")),
      assertions.visible(query.button("3")),
      assertions.current(query.button("1"), "page"),
      assertions.not.visible(query.row("배포 자동화")),
      actions.click(query.button("다음 페이지")),
      assertions.visible(query.row("배포 자동화")),
      assertions.not.visible(query.row("API 문서 작성")),
      assertions.current(query.button("2"), "page"),
      assertions.not.current(query.button("1"), "page"),
    );
  });
});

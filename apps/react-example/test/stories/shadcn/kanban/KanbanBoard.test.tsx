import "../../../index.css";
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { KanbanBoard } from "./KanbanBoard.tsx";

describe("KanbanBoard", () => {
  it("초기 접근성 스냅샷", async () => {
    await runSiheom(
      given.render(<KanbanBoard />),
      assertions.a11ySnapshot(query.region("칸반"), "kanban-initial.snap"),
    );
  });

  it("카드를 다른 열로 드래그하면 해당 열에 표시된다", async () => {
    await runSiheom(
      given.render(<KanbanBoard />),
      assertions.visible(query.within(query.list("진행 중"), query.listitem("디자인"))),
      actions.dragAndDrop(query.listitem("디자인"), query.list("완료")),
      assertions.visible(query.within(query.list("완료"), query.listitem("디자인"))),
      assertions.not.visible(query.within(query.list("진행 중"), query.listitem("디자인"))),
    );
  });
});

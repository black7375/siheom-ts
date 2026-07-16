import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { DeleteDialog } from "./DeleteDialog";

describe("DeleteDialog", () => {
  it("항목을 삭제할 수 있다", async () => {
    await runSiheom(
      given.render(<DeleteDialog initialItems={["밥 먹기", "운동하기"]} />),

      assertions.visible(query.listitem("밥 먹기")),
      assertions.visible(query.listitem("운동하기")),

      actions.click(query.button("밥 먹기 삭제")),
      assertions.visible(query.dialog("삭제 확인")),
      actions.click(query.within(query.dialog("삭제 확인"), query.button("삭제"))),

      assertions.not.visible(query.listitem("밥 먹기")),
      assertions.visible(query.listitem("운동하기")),
    );
  });

  it("삭제를 취소할 수 있다", async () => {
    await runSiheom(
      given.render(<DeleteDialog initialItems={["밥 먹기"]} />),

      actions.click(query.button("밥 먹기 삭제")),
      assertions.visible(query.dialog("삭제 확인")),
      actions.click(query.within(query.dialog("삭제 확인"), query.button("취소"))),

      assertions.not.visible(query.dialog("삭제 확인")),
      assertions.visible(query.listitem("밥 먹기")),
    );
  });

  it("초기 상태의 접근성 스냅샷을 확인한다", () => {
    return runSiheom(
      given.render(<DeleteDialog initialItems={["밥 먹기", "운동하기"]} />),
      assertions.a11ySnapshot(query.region("todo-list"), "delete-dialog-initial.snap"),
    );
  });

  it("다이얼로그 열린 상태의 접근성 스냅샷을 확인한다", async () => {
    await runSiheom(
      given.render(<DeleteDialog initialItems={["밥 먹기"]} />),
      actions.click(query.button("밥 먹기 삭제")),
      assertions.a11ySnapshot(query.dialog("삭제 확인"), "delete-dialog-open.snap"),
    );
  });
});

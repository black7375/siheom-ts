import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { DeleteDialog } from "./DeleteDialog";

describe("DeleteDialog", () => {
  it("항목을 삭제할 수 있다", async () => {
    await runSiheom(
      // given 처음에는 두 항목이 있다
      given.render(<DeleteDialog initialItems={["밥 먹기", "운동하기"]} />),
      assertions.a11ySnapshot(query.region("todo-list"), "delete-dialog-initial.snap"),

      // when 밥 먹기 항목을 삭제 버튼을 클릭하면
      actions.click(query.button("밥 먹기 삭제")),

      // then 다이얼로그가 열린다
      assertions.a11ySnapshot(query.alertdialog("삭제 확인"), "delete-dialog-open.snap"),

      // when 삭제 버튼을 클릭하면
      actions.click(query.within(query.alertdialog("삭제 확인"), query.button("삭제"))),

      // then 밥 먹기 항목이 삭제된다
      assertions.not.visible(query.listitem("밥 먹기")),
      assertions.visible(query.listitem("운동하기")),
    );
  });

  it("삭제를 취소할 수 있다", async () => {
    await runSiheom(
      // given 처음에는 한 항목이 있다
      given.render(<DeleteDialog initialItems={["밥 먹기"]} />),

      // when 밥 먹기 항목을 삭제 버튼을 클릭하면
      actions.click(query.button("밥 먹기 삭제")),

      // when 취소 버튼을 클릭하면
      actions.click(query.within(query.alertdialog("삭제 확인"), query.button("취소"))),

      // then 다이얼로그가 닫히고 밥 먹기 항목이 유지된다
      assertions.not.visible(query.alertdialog("삭제 확인")),
      assertions.visible(query.listitem("밥 먹기")),
    );
  });
});

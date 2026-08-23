import "../../index.css";
import { describe, it } from "vitest";
import { query } from "@siheom/core";
import { DeleteDialog } from "../DeleteDialog";
import { createVirtualScreenReaderSiheom } from "./createVirtualScreenReaderSiheom";

describe("DeleteDialog + virtual screen reader", () => {
  it("삭제 버튼을 누르면 스크린 리더가 대화상자 제목을 말한다", async () => {
    const { runSiheom, actions, assertions, given } = createVirtualScreenReaderSiheom();

    await runSiheom(
      given.render(<DeleteDialog initialItems={["회의 준비"]} />),
      given.startScreenReader(),
      actions.click(query.button("회의 준비 삭제")),
      assertions.screenReaderContainsSpokenPhrase(query.dialog("삭제 확인"), "삭제 확인"),
      given.stopScreenReader(),
    );
  });
});

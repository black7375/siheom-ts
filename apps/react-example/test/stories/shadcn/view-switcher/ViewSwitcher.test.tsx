import "../../../index.css";
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { ViewSwitcher } from "./ViewSwitcher";

describe("ViewSwitcher", () => {
  it("목록 보기에서 그리드 보기로 전환할 수 있다", async () => {
    await runSiheom(
      given.render(<ViewSwitcher />),
      assertions.visible(query.region("목록 보기")),
      actions.click(query.button("그리드")),
      assertions.visible(query.region("그리드 보기")),
      assertions.not.visible(query.region("목록 보기")),
    );
  });
});

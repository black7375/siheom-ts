import "../../../index.css";
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { MobileFilter } from "./MobileFilter.tsx";

describe("MobileFilter", () => {
  it("모바일에서 필터 시트를 열고 필터를 선택할 수 있다", async () => {
    await runSiheom(
      given.render(<MobileFilter />),
      assertions.textContent(query.status("선택된 필터"), "전체"),
      actions.click(query.button("필터")),
      assertions.visible(query.dialog("필터")),
      actions.click(query.button("진행 중")),
      assertions.textContent(query.status("선택된 필터"), "진행 중"),
      assertions.not.visible(query.dialog("필터")),
    );
  });
});

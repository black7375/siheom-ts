import "../../../index.css";
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { SaveFeedback } from "./SaveFeedback.tsx";

describe("SaveFeedback", () => {
  it("저장 버튼을 누르면 토스트 피드백이 보인다", async () => {
    await runSiheom(
      given.render(<SaveFeedback />),
      actions.click(query.button("저장")),
      assertions.textContent(query.region("Notifications alt+T"), "저장됨"),
    );
  });
});

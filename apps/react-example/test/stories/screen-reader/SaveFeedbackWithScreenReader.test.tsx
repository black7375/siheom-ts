import "../../index.css";
import { describe, it } from "vitest";
import { query } from "@siheom/core";
import { SaveFeedback } from "../shadcn/save-feedback/SaveFeedback";
import { createVirtualScreenReaderSiheom } from "./createVirtualScreenReaderSiheom";

describe("SaveFeedback + virtual screen reader", () => {
  it("저장 버튼을 누르면 스크린 리더가 토스트를 말한다", async () => {
    const { runSiheom, actions, assertions, given } = createVirtualScreenReaderSiheom();

    await runSiheom(
      given.render(<SaveFeedback />),
      given.startScreenReader(),
      actions.click(query.button("저장")),
      assertions.screenReaderContainsSpokenPhrase(query.region("저장 피드백"), "저장됨"),
      given.stopScreenReader(),
    );
  });
});

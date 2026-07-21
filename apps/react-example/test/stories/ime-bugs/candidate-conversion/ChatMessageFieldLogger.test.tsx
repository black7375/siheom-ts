import { describe, it } from "vitest";
import { actions, assertions, given, query } from "@siheom/react";

import { ChatMessageFieldLogger } from "./ChatMessageFieldLogger";
import { runSiheom } from "../../runSiheom";

describe("ChatMessageFieldLogger", () => {
  it("broken/fixed 모드와 변환 시나리오 지시가 보인다", () => {
    return runSiheom(
      given.render(<ChatMessageFieldLogger />),
      assertions.visible(query.heading("Candidate conversion — chat Enter (IME bug)")),
      assertions.visible(query.button("broken")),
      actions.click(query.button("fixed")),
      assertions.visible(query.textbox("메시지")),
    );
  });
});

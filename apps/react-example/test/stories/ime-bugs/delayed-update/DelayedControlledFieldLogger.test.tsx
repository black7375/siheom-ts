import { describe, it } from "vitest";
import { actions, assertions, given, query } from "@siheom/react";

import { DelayedControlledFieldLogger } from "./DelayedControlledFieldLogger";
import { runSiheom } from "../../runSiheom";

describe("DelayedControlledFieldLogger", () => {
  it("broken/fixed 모드와 캡처 지시가 보인다", () => {
    return runSiheom(
      given.render(<DelayedControlledFieldLogger />),
      assertions.visible(query.heading("Delayed controlled update (IME bug)")),
      assertions.visible(query.button("broken")),
      actions.click(query.button("fixed")),
      assertions.visible(query.textbox("이름")),
    );
  });
});

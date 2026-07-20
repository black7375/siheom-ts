import { describe, it } from "vitest";
import { actions, assertions, given, query } from "@siheom/react";

import { FocusStealComboboxLogger } from "./FocusStealComboboxLogger";
import { runSiheom } from "../../runSiheom";

describe("FocusStealComboboxLogger", () => {
  it("broken/fixed 모드와 캡처 지시가 보인다", () => {
    return runSiheom(
      given.render(<FocusStealComboboxLogger />),
      assertions.visible(query.heading("Focus-steal Combobox (IME bug)")),
      assertions.visible(query.button("broken")),
      assertions.visible(query.button("fixed")),
      actions.click(query.button("fixed")),
      assertions.visible(query.textbox("검색")),
    );
  });
});

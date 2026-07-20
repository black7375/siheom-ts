import { describe, it } from "vitest";
import { actions, assertions, given, query } from "@siheom/react";

import { SearchFieldLogger } from "./SearchFieldLogger";
import { runSiheom } from "../../runSiheom";

describe("SearchFieldLogger", () => {
  it("broken/fixed 모드와 캡처 지시가 보인다", () => {
    return runSiheom(
      given.render(<SearchFieldLogger />),
      assertions.visible(query.heading("Enter-submit SearchField (IME bug)")),
      assertions.visible(query.button("broken")),
      actions.click(query.button("fixed")),
      assertions.visible(query.searchbox("검색")),
    );
  });
});

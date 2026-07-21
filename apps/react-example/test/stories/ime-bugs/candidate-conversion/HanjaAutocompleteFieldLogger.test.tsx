import { describe, it } from "vitest";
import { actions, assertions, given, query } from "@siheom/react";

import { HanjaAutocompleteFieldLogger } from "./HanjaAutocompleteFieldLogger";
import { runSiheom } from "../../runSiheom";

describe("HanjaAutocompleteFieldLogger", () => {
  it("broken/fixed 모드와 한자 변환 캡처 지시가 보인다", () => {
    return runSiheom(
      given.render(<HanjaAutocompleteFieldLogger />),
      assertions.visible(query.heading("Hanja autocomplete conflict (IME bug)")),
      assertions.visible(query.button("broken")),
      actions.click(query.button("fixed")),
      assertions.visible(query.textbox("이름")),
    );
  });
});

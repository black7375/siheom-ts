import { describe, it } from "vitest";
import { query } from "@siheom/core";

import { HanjaAutocompleteField } from "./HanjaAutocompleteField";
import { runWithHanjaImeSiheom } from "../shared/runWithHanjaImeSiheom";

describe("HanjaAutocompleteField + typeHanja", () => {
  it("fixed + macos-chrome-apple: first syllable yields stripped 金", async () => {
    const { runSiheom, actions, assertions, given } = runWithHanjaImeSiheom({
      profile: "macos-chrome-apple",
    });

    await runSiheom(
      given.render(<HanjaAutocompleteField mode="fixed" />),
      actions.typeHanja(query.textbox("이름"), "金", "김"),
      assertions.value(query.textbox("이름"), "金"),
    );
  });

  it("fixed + macos-chrome-apple: full name yields 金泰熙", async () => {
    const { runSiheom, actions, assertions, given } = runWithHanjaImeSiheom({
      profile: "macos-chrome-apple",
    });

    await runSiheom(
      given.render(<HanjaAutocompleteField mode="fixed" />),
      actions.typeHanja(query.textbox("이름"), "金泰熙", "김태희"),
      assertions.value(query.textbox("이름"), "金泰熙"),
    );
  });
});

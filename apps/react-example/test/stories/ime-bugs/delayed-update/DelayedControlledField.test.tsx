import { describe, it } from "vitest";
import { actions, assertions, given, query } from "@siheom/react";

import { DelayedControlledField } from "./DelayedControlledField";
import { runSiheom } from "../../runSiheom";

describe("DelayedControlledField", () => {
  it("broken 모드: 영문 입력은 composition이 없어 값이 따라온다", async () => {
    await runSiheom(
      given.render(<DelayedControlledField mode="broken" />),
      actions.type(query.textbox("이름"), "hello"),
      assertions.value(query.textbox("이름"), "hello"),
      assertions.textContent(query.status("React state 값"), "hello"),
    );
  });

  it("fixed 모드: 영문 입력 값이 동기 반영된다", async () => {
    await runSiheom(
      given.render(<DelayedControlledField mode="fixed" />),
      actions.type(query.textbox("이름"), "hello"),
      assertions.value(query.textbox("이름"), "hello"),
      assertions.textContent(query.status("React state 값"), "hello"),
    );
  });
});

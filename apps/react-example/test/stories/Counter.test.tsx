import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { Counter } from "./Counter";

describe("Counter", () => {
  it("값을 증가시킬 수 있다", () => {
    return runSiheom(
      given.render(<Counter />),
      assertions.a11ySnapshot(query.button("0"), "counter-initial.snap"),

      actions.click(query.button("0")),
      actions.click(query.button("1")),
      assertions.visible(query.button("2")),

      assertions.a11ySnapshot(query.button("2"), "counter-after-clicks.snap"),
    );
  });
});

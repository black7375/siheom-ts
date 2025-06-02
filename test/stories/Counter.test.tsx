import { describe, it } from "vitest";
import { assertions, query, runSiheom } from "../../src";
import { actions } from "../../src/siheom/action";
import { given } from "../../src/siheom/given";
import { Counter } from "./Counter";

describe("Counter", () => {
  it("값을 증가시킬 수 있다", () => {
    return runSiheom(
        given.render(<Counter />),
        actions.click(query.button("0")),
        actions.click(query.button("1")),
        assertions.visible(query.button("2"))
    )
  })  
})
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "./index.ts";
import { Counter } from "./Counter.tsx";

describe("Counter", () => {
  it("값을 증가시킬 수 있다", async () => {
    await runSiheom(
      given.render(<Counter />),
      actions.click(query.button("0")),
      actions.click(query.button("1")),
      assertions.visible(query.button("2")),
    );
  });
});

import { describe, it } from "vitest";
import { actions, assertions, effect, given, query, runSiheom, withFakeTimers } from "./index.ts";
import { TickerOnStart } from "./TickerOnStart.tsx";

describe("withFakeTimers", () => {
  it("clicks with user delay middleware then advances elapsed time", async () => {
    await runSiheom(
      withFakeTimers(
        given.render(TickerOnStart),
        actions.click(query.button("start")),
        effect.elapsed(1_000),
        assertions.textContent(query.status("count"), "1"),
      ),
    );
  });
});

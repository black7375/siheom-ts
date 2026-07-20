import { describe, it } from "vitest";
import { actions, assertions, effect, given, query, runSiheom, withFakeTimers } from "@siheom/react";
import { CountdownApp } from "./CountdownApp";

describe("CountdownApp", () => {
  it("처음에는 25분이 표시된다", async () => {
    await runSiheom(
      given.render(<CountdownApp durationMinutes={25} />),
      assertions.textContent(query.timer("남은 시간"), "25:00"),
    );
  });

  it("시작 후 1초가 지나면 24:59가 표시된다", async () => {
    await runSiheom(
      withFakeTimers(
        given.render(<CountdownApp durationMinutes={25} />),
        actions.click(query.button("시작")),
        effect.elapsed(1_000),
        assertions.textContent(query.timer("남은 시간"), "24:59"),
      ),
    );
  });
});

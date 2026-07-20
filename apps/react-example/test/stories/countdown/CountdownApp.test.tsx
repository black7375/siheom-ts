import { describe, it } from "vitest";
import {
  actions,
  assertions,
  effect,
  given,
  query,
  runSiheom,
  withFakeTimers,
} from "@siheom/react";
import { CountdownApp } from "./CountdownApp";

describe("CountdownApp", () => {
  it("시작 후 1초가 지나면 24:59가 표시된다", async () => {
    await runSiheom(
      withFakeTimers(
        given.render(<CountdownApp durationMinutes={25} />),
        assertions.textContent(query.timer("남은 시간"), "25:00"),

        actions.click(query.button("시작")),
        effect.elapsed(1_000),
        assertions.textContent(query.timer("남은 시간"), "24:59"),
      ),
    );
  });

  it("일시정지하면 시간이 지나도 남은 시간이 줄어들지 않는다", async () => {
    await runSiheom(
      withFakeTimers(
        given.render(<CountdownApp durationMinutes={25} />),
        actions.click(query.button("시작")),
        effect.elapsed(1_000),
        actions.click(query.button("일시정지")),
        effect.elapsed(5_000),
        assertions.textContent(query.timer("남은 시간"), "24:59"),
      ),
    );
  });

  it("리셋하면 다시 25:00이 표시된다", async () => {
    await runSiheom(
      withFakeTimers(
        given.render(<CountdownApp durationMinutes={25} />),
        actions.click(query.button("시작")),
        effect.elapsed(1_000),
        actions.click(query.button("리셋")),
        assertions.textContent(query.timer("남은 시간"), "25:00"),
      ),
    );
  });

  it("시간이 모두 지나면 완료가 표시된다", async () => {
    await runSiheom(
      withFakeTimers(
        given.render(<CountdownApp durationMinutes={1} />),
        actions.click(query.button("시작")),
        effect.elapsed(1_000 * 30),
        assertions.textContent(query.timer("남은 시간"), "00:30"),
        effect.elapsed(1_000 * 25),
        assertions.textContent(query.timer("남은 시간"), "00:05"),
        effect.elapsed(1_000 * 4),
        assertions.textContent(query.timer("남은 시간"), "00:01"),
        effect.elapsed(1_000),
        assertions.visible(query.status("완료")),
      ),
    );
  });
});

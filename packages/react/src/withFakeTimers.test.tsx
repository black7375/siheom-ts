import { cleanup } from "@testing-library/react";
import { beforeEach, describe, it } from "vitest";
import { useEffect, useState } from "react";
import { actions, assertions, effect, given, query, runSiheom, withFakeTimers } from "./index.ts";

function TickerOnStart() {
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!running) return;

    const intervalId = setInterval(() => {
      setCount((value) => value + 1);
    }, 1_000);

    return () => clearInterval(intervalId);
  }, [running]);

  return (
    <div>
      <div role="status" aria-label="count">
        {count}
      </div>
      <button type="button" aria-label="start" onClick={() => setRunning(true)}>
        start
      </button>
    </div>
  );
}

describe("withFakeTimers", () => {
  beforeEach(() => {
    cleanup();
  });

  it("runs click actions inside the scope", async () => {
    await runSiheom(
      withFakeTimers(
        given.render(
          <button type="button" aria-label="start">
            start
          </button>,
        ),
        actions.click(query.button("start")),
      ),
    );
  });

  it("clicks with user delay middleware then advances elapsed time", async () => {
    await runSiheom(
      withFakeTimers(
        given.render(<TickerOnStart />),
        actions.click(query.button("start")),
        effect.elapsed(1_000),
        assertions.textContent(query.status("count"), "1"),
      ),
    );
  });
});

import { describe, it } from "vitest";
import { useEffect, useState } from "react";
import { assertions, effect, given, query, runSiheom, withFakeTimers } from "./index.ts";

function DeferredStatus() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setReady(true), 5_000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div role="status" aria-label="ready">
      {ready ? "yes" : "no"}
    </div>
  );
}

describe("effect.runAllTimers", () => {
  it("drains remaining fake timers so deferred UI updates settle", async () => {
    await runSiheom(
      withFakeTimers(
        given.render(<DeferredStatus />),
        effect.runAllTimers(),
        assertions.textContent(query.status("ready"), "yes"),
      ),
    );
  });
});

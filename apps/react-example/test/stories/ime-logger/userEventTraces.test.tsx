import { describe, expect, it } from "vitest";
import { userEvent } from "@testing-library/user-event";

import { recordInputEvents } from "./recordInputEvents";
import { CAPTURE_SCENARIOS } from "./scenarios";
import { buildImeTrace, formatImeTraceJson } from "./serializeImeEvent";

describe("user-event capture fixtures", () => {
  it.each(CAPTURE_SCENARIOS)(
    "records $id the way @testing-library/user-event fires events",
    async (scenario) => {
      const input = document.createElement("input");
      input.setAttribute("aria-label", "fixture-input");
      document.body.append(input);

      const user = userEvent.setup();
      const events = await recordInputEvents(input, async () => {
        await user.click(input);
        await user.keyboard(scenario.userEventScript);
      });

      expect(input.value).toBe(scenario.expectedValue);

      const trace = buildImeTrace({
        os: "synthetic",
        browser: "chromium",
        ime: "user-event",
        scenarioId: scenario.id,
        source: "user-event",
        capturedAt: "1970-01-01T00:00:00.000Z",
        events,
      });

      await expect(formatImeTraceJson(trace)).toMatchFileSnapshot(
        `./fixtures/user-event/${scenario.id}.json`,
      );

      input.remove();
    },
  );
});

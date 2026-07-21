import { describe, expect, it } from "vitest";
import { userEvent } from "@testing-library/user-event";

import { recordInputEvents } from "../../ime-logger/recordInputEvents";
import { buildImeTrace, formatImeTraceJson } from "../../ime-logger/serializeImeEvent";
import { CAPTURE_SCENARIOS } from "./scenarios";

describe("candidate-conversion user-event capture fixtures", () => {
  it.each(CAPTURE_SCENARIOS)(
    "records $id the way @testing-library/user-event fires events",
    async (scenario) => {
      const textarea = document.createElement("textarea");
      textarea.setAttribute("aria-label", "fixture-textarea");
      document.body.append(textarea);

      const user = userEvent.setup();
      const events = await recordInputEvents(textarea, async () => {
        await user.click(textarea);
        await user.keyboard(scenario.userEventScript);
      });

      expect(textarea.value).toBe(scenario.expectedValue);

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

      textarea.remove();
    },
  );
});
